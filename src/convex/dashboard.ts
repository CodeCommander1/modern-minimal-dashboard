import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get dashboard overview data
export const getDashboardOverview = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    // Get progress data
    const progressData = await ctx.db
      .query("progress")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Get pending tasks
    const pendingTasks = await ctx.db
      .query("tasks")
      .withIndex("by_user_completed", (q) => q.eq("userId", user._id).eq("completed", false))
      .collect();

    // Get active goals
    const activeGoals = await ctx.db
      .query("goals")
      .withIndex("by_user_completed", (q) => q.eq("userId", user._id).eq("completed", false))
      .collect();

    // Get recent scores
    const recentScores = await ctx.db
      .query("scores")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(5);

    return {
      progressData,
      pendingTasks: pendingTasks.length,
      activeGoals: activeGoals.length,
      recentScores,
      user: {
        name: user.name,
        email: user.email,
        currentCareerGoal: user.currentCareerGoal,
        academicLevel: user.academicLevel,
        interests: user.interests,
      },
    };
  },
});

// Get tasks
export const getTasks = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

// Create task
export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    return await ctx.db.insert("tasks", {
      userId: user._id,
      title: args.title,
      description: args.description,
      completed: false,
      dueDate: args.dueDate,
      priority: args.priority,
      category: args.category,
    });
  },
});

// Toggle task completion
export const toggleTask = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== user._id) {
      throw new Error("Task not found or unauthorized");
    }

    return await ctx.db.patch(args.taskId, {
      completed: !task.completed,
    });
  },
});

// Get goals
export const getGoals = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("goals")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

// Create goal
export const createGoal = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    targetDate: v.optional(v.number()),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    return await ctx.db.insert("goals", {
      userId: user._id,
      title: args.title,
      description: args.description,
      targetDate: args.targetDate,
      completed: false,
      progress: 0,
      category: args.category,
    });
  },
});

// Get study materials
export const getStudyMaterials = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("studyMaterials")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

// Get scholarships
export const getScholarships = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("scholarships")
      .order("asc")
      .take(10);
  },
});

// Get scores by class and optionally stream (for class12)
export const getScoresByClassStream = query({
  args: {
    classLevel: v.union(v.literal("class10"), v.literal("class12")),
    stream: v.optional(v.union(v.literal("Science"), v.literal("Commerce"), v.literal("Arts"))),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    if (args.classLevel === "class10") {
      return await ctx.db
        .query("scores")
        .withIndex("by_user_and_class", (q) => q.eq("userId", user._id).eq("classLevel", "class10"))
        .collect();
    }

    // class12
    if (args.stream) {
      return await ctx.db
        .query("scores")
        .withIndex("by_user_class_stream_subject", (q) =>
          q.eq("userId", user._id).eq("classLevel", "class12").eq("stream", args.stream!),
        )
        .collect();
    }

    // If stream not provided, return all class12 scores
    return await ctx.db
      .query("scores")
      .withIndex("by_user_and_class", (q) => q.eq("userId", user._id).eq("classLevel", "class12"))
      .collect();
  },
});

// Save or update multiple scores at once
export const saveScoresBulk = mutation({
  args: {
    classLevel: v.union(v.literal("class10"), v.literal("class12")),
    stream: v.optional(v.union(v.literal("Science"), v.literal("Commerce"), v.literal("Arts"))),
    scores: v.array(
      v.object({
        subject: v.string(),
        score: v.number(),
        maxScore: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const now = Date.now();

    for (const s of args.scores) {
      if (args.classLevel === "class12" && args.stream) {
        // Try to find an existing document for class12 + stream + subject
        const existing = await ctx.db
          .query("scores")
          .withIndex("by_user_class_stream_subject", (q) =>
            q
              .eq("userId", user._id)
              .eq("classLevel", "class12")
              .eq("stream", args.stream!)
              .eq("subject", s.subject),
          )
          .unique();

        if (existing) {
          await ctx.db.patch(existing._id, {
            score: s.score,
            maxScore: s.maxScore,
            testDate: now,
            testType: "Annual",
          });
        } else {
          await ctx.db.insert("scores", {
            userId: user._id,
            subject: s.subject,
            score: s.score,
            maxScore: s.maxScore,
            testDate: now,
            testType: "Annual",
            classLevel: "class12",
            stream: args.stream,
          });
        }
      } else {
        // class10 (no stream)
        const existing = await ctx.db
          .query("scores")
          .withIndex("by_user_class_and_subject", (q) =>
            q.eq("userId", user._id).eq("classLevel", "class10").eq("subject", s.subject),
          )
          .unique();

        if (existing) {
          await ctx.db.patch(existing._id, {
            score: s.score,
            maxScore: s.maxScore,
            testDate: now,
            testType: "Annual",
          });
        } else {
          await ctx.db.insert("scores", {
            userId: user._id,
            subject: s.subject,
            score: s.score,
            maxScore: s.maxScore,
            testDate: now,
            testType: "Annual",
            classLevel: "class10",
          });
        }
      }
    }

    return "Saved";
  },
});

export const setCareerGoal = mutation({
  args: { currentCareerGoal: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    await ctx.db.patch(user._id, { currentCareerGoal: args.currentCareerGoal.trim() });
    return "ok";
  },
});

// Add: Save Interests & Hobbies questionnaire result
export const saveInterestsResult = mutation({
  args: {
    science: v.number(),
    commerce: v.number(),
    arts: v.number(),
    recommended: v.union(v.literal("Science"), v.literal("Commerce"), v.literal("Arts")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const summary = [
      `Science: ${args.science} points`,
      `Commerce: ${args.commerce} points`,
      `Arts: ${args.arts} points`,
      `Recommended: ${args.recommended}`,
    ];

    await ctx.db.patch(user._id, {
      interests: summary,
    });
    return "saved";
  },
});

export const createVacantSeat = mutation({
  args: {
    collegeName: v.string(),
    branch: v.string(),
    seats: v.number(),
    lastDate: v.number(), // ms since epoch
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    if (args.seats <= 0) throw new Error("Seats must be greater than 0");
    if (Number.isNaN(args.lastDate) || args.lastDate <= 0) {
      throw new Error("Invalid last date");
    }

    await ctx.db.insert("vacantSeats", {
      userId: user._id,
      collegeName: args.collegeName.trim(),
      branch: args.branch.trim(),
      seats: Math.floor(args.seats),
      lastDate: args.lastDate,
      notes: args.notes?.trim(),
    });
    return "ok";
  },
});

// College admin: list my entries
export const listMyVacantSeats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    return await ctx.db
      .query("vacantSeats")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

// Students: list open (not expired) entries
export const listOpenVacantSeats = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    // Return those whose lastDate >= now, ordered by lastDate ascending
    return await ctx.db
      .query("vacantSeats")
      .withIndex("by_lastDate", (q) => q.gte("lastDate", now))
      .order("asc")
      .take(20);
  },
});

export const updateVacantSeat = mutation({
  args: {
    id: v.id("vacantSeats"),
    collegeName: v.optional(v.string()),
    branch: v.optional(v.string()),
    seats: v.optional(v.number()),
    lastDate: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const doc = await ctx.db.get(args.id);
    if (!doc || doc.userId !== user._id) throw new Error("Not found or unauthorized");

    const patch: Record<string, unknown> = {};
    if (args.collegeName !== undefined) patch.collegeName = args.collegeName.trim();
    if (args.branch !== undefined) patch.branch = args.branch.trim();
    if (args.seats !== undefined) {
      if (args.seats <= 0) throw new Error("Seats must be > 0");
      patch.seats = Math.floor(args.seats);
    }
    if (args.lastDate !== undefined) {
      if (Number.isNaN(args.lastDate) || args.lastDate <= 0) throw new Error("Invalid last date");
      patch.lastDate = args.lastDate;
    }
    if (args.notes !== undefined) patch.notes = args.notes?.trim();
    await ctx.db.patch(args.id, patch);
    return "ok";
  },
});

export const deleteVacantSeat = mutation({
  args: { id: v.id("vacantSeats") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const doc = await ctx.db.get(args.id);
    if (!doc || doc.userId !== user._id) throw new Error("Not found or unauthorized");
    await ctx.db.delete(args.id);
    return "ok";
  },
});

// Applications
export const listApplications = query({
  args: { branch: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    if (args.branch) {
      return await ctx.db
        .query("applications")
        .withIndex("by_user_branch", (q) => q.eq("userId", user._id).eq("branch", args.branch!))
        .order("asc")
        .take(200);
    }
    return await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("asc")
      .take(200);
  },
});

export const seedApplications = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const samples = [
      { studentName: "Aarav Sharma", branch: "Computer Science", meritRank: 12, category: "General" },
      { studentName: "Isha Verma", branch: "Mechanical", meritRank: 34, category: "OBC" },
      { studentName: "Rohan Gupta", branch: "Commerce", meritRank: 18, category: "General" },
      { studentName: "Neha Singh", branch: "Arts", meritRank: 45, category: "SC" },
      { studentName: "Vikram Mehta", branch: "Computer Science", meritRank: 5, category: "General" },
    ];
    for (const s of samples) {
      await ctx.db.insert("applications", {
        userId: user._id,
        studentName: s.studentName,
        branch: s.branch,
        meritRank: s.meritRank,
        category: s.category,
        contactEmail: undefined,
        contactPhone: undefined,
        notes: undefined,
      });
    }
    return "ok";
  },
});

// Merit lists
export const upsertMeritList = mutation({
  args: { branch: v.string(), details: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("meritLists")
      .withIndex("by_user_branch", (q) => q.eq("userId", user._id).eq("branch", args.branch))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { details: args.details, lastUpdated: Date.now() });
    } else {
      await ctx.db.insert("meritLists", {
        userId: user._id,
        branch: args.branch,
        details: args.details,
        lastUpdated: Date.now(),
      });
    }
    return "ok";
  },
});

export const listMeritLists = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    return await ctx.db
      .query("meritLists")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

// Announcements
export const createAnnouncement = mutation({
  args: { message: v.string(), branch: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    await ctx.db.insert("announcements", {
      userId: user._id,
      message: args.message.trim(),
      branch: args.branch?.trim(),
      createdAt: Date.now(),
    });
    return "ok";
  },
});

export const listAnnouncements = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    return await ctx.db
      .query("announcements")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50);
  },
});

// Update college profile
export const updateCollegeProfile = mutation({
  args: {
    collegeName: v.optional(v.string()),
    collegeLogoUrl: v.optional(v.string()),
    collegeContactInfo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const patch: Record<string, unknown> = {};
    if (args.collegeName !== undefined) patch.collegeName = args.collegeName.trim();
    if (args.collegeLogoUrl !== undefined) patch.collegeLogoUrl = args.collegeLogoUrl.trim();
    if (args.collegeContactInfo !== undefined) patch.collegeContactInfo = args.collegeContactInfo.trim();
    await ctx.db.patch(user._id, patch);
    return "ok";
  },
});

// List Government Colleges with optional stream filter
export const listGovernmentColleges = query({
  args: {
    stream: v.optional(v.union(v.literal("Science"), v.literal("Commerce"), v.literal("Arts"))),
  },
  handler: async (ctx, args) => {
    if (args.stream === "Science") {
      return await ctx.db
        .query("governmentColleges")
        .withIndex("by_offersScience", (q) => q.eq("offersScience", true))
        .order("asc")
        .take(60);
    }
    if (args.stream === "Commerce") {
      return await ctx.db
        .query("governmentColleges")
        .withIndex("by_offersCommerce", (q) => q.eq("offersCommerce", true))
        .order("asc")
        .take(60);
    }
    if (args.stream === "Arts") {
      return await ctx.db
        .query("governmentColleges")
        .withIndex("by_offersArts", (q) => q.eq("offersArts", true))
        .order("asc")
        .take(60);
    }
    return await ctx.db
      .query("governmentColleges")
      .withIndex("by_lastDate", (q) => q.gte("lastDate", 0))
      .order("asc")
      .take(60);
  },
});

// Seed at least 30 government colleges across Science/Commerce/Arts
export const seedGovernmentColleges = mutation({
  args: {},
  handler: async (ctx) => {
    // Seed only if empty
    const existing = await ctx.db.query("governmentColleges").take(1);
    if (existing.length > 0) return "already-seeded";

    const now = Date.now();
    const oneMonth = 30 * 24 * 60 * 60 * 1000;

    const data = [
      // Science (10)
      {
        name: "National Institute of Science & Technology",
        city: "New Delhi",
        state: "Delhi",
        officialUrl: "https://www.example.edu/nist",
        offersScience: true,
        offersCommerce: false,
        offersArts: false,
        topCourses: ["B.Sc Physics", "B.Sc Chemistry", "B.Sc Mathematics"],
        seatsScience: 180,
        seatsCommerce: undefined,
        seatsArts: undefined,
        lastDate: now + oneMonth * 1,
      },
      {
        name: "Government College of Science",
        city: "Mumbai",
        state: "Maharashtra",
        officialUrl: "https://www.example.edu/gcs",
        offersScience: true,
        offersCommerce: false,
        offersArts: false,
        topCourses: ["B.Sc Computer Science", "B.Sc Botany", "B.Sc Zoology"],
        seatsScience: 200,
        seatsCommerce: undefined,
        seatsArts: undefined,
        lastDate: now + oneMonth * 1.2,
      },
      {
        name: "State Institute of Technology",
        city: "Bengaluru",
        state: "Karnataka",
        officialUrl: "https://www.example.edu/sit",
        offersScience: true,
        offersCommerce: false,
        offersArts: false,
        topCourses: ["B.Sc Data Science", "B.Sc Electronics", "B.Sc Statistics"],
        seatsScience: 220,
        seatsCommerce: undefined,
        seatsArts: undefined,
        lastDate: now + oneMonth * 0.9,
      },
      {
        name: "Central Science College",
        city: "Chennai",
        state: "Tamil Nadu",
        officialUrl: "https://www.example.edu/csc",
        offersScience: true,
        offersCommerce: false,
        offersArts: false,
        topCourses: ["B.Sc Microbiology", "B.Sc Biochemistry", "B.Sc Biotechnology"],
        seatsScience: 160,
        seatsCommerce: undefined,
        seatsArts: undefined,
        lastDate: now + oneMonth * 1.4,
      },
      {
        name: "Government Institute of Pure Sciences",
        city: "Kolkata",
        state: "West Bengal",
        officialUrl: "https://www.example.edu/gips",
        offersScience: true,
        offersCommerce: false,
        offersArts: false,
        topCourses: ["B.Sc Geology", "B.Sc Environmental Science", "B.Sc Mathematics"],
        seatsScience: 150,
        seatsCommerce: undefined,
        seatsArts: undefined,
        lastDate: now + oneMonth * 1.1,
      },
      {
        name: "Maharashtra College of Science",
        city: "Pune",
        state: "Maharashtra",
        officialUrl: "https://www.example.edu/mcs",
        offersScience: true,
        offersCommerce: false,
        offersArts: false,
        topCourses: ["B.Sc Computer Science", "B.Sc Physics", "B.Sc Chemistry"],
        seatsScience: 190,
        seatsCommerce: undefined,
        seatsArts: undefined,
        lastDate: now + oneMonth * 1.3,
      },
      {
        name: "Andhra Government Science College",
        city: "Vijayawada",
        state: "Andhra Pradesh",
        officialUrl: "https://www.example.edu/agsc",
        offersScience: true,
        offersCommerce: false,
        offersArts: false,
        topCourses: ["B.Sc Biotechnology", "B.Sc Microbiology", "B.Sc Zoology"],
        seatsScience: 140,
        seatsCommerce: undefined,
        seatsArts: undefined,
        lastDate: now + oneMonth * 0.8,
      },
      {
        name: "Punjab Institute of Science",
        city: "Amritsar",
        state: "Punjab",
        officialUrl: "https://www.example.edu/pis",
        offersScience: true,
        offersCommerce: false,
        offersArts: false,
        topCourses: ["B.Sc Agriculture", "B.Sc Food Technology", "B.Sc Physics"],
        seatsScience: 170,
        seatsCommerce: undefined,
        seatsArts: undefined,
        lastDate: now + oneMonth * 1.6,
      },
      {
        name: "Kerala Science College",
        city: "Thiruvananthapuram",
        state: "Kerala",
        officialUrl: "https://www.example.edu/ksc",
        offersScience: true,
        offersCommerce: false,
        offersArts: false,
        topCourses: ["B.Sc Statistics", "B.Sc Mathematics", "B.Sc Computer Science"],
        seatsScience: 180,
        seatsCommerce: undefined,
        seatsArts: undefined,
        lastDate: now + oneMonth * 1.7,
      },
      {
        name: "Rajasthan Govt. Science Institute",
        city: "Jaipur",
        state: "Rajasthan",
        officialUrl: "https://www.example.edu/rsgi",
        offersScience: true,
        offersCommerce: false,
        offersArts: false,
        topCourses: ["B.Sc Geology", "B.Sc Chemistry", "B.Sc Physics"],
        seatsScience: 160,
        seatsCommerce: undefined,
        seatsArts: undefined,
        lastDate: now + oneMonth * 1.05,
      },

      // Commerce (10)
      {
        name: "Government College of Commerce & Economics",
        city: "Mumbai",
        state: "Maharashtra",
        officialUrl: "https://www.example.edu/gcce",
        offersScience: false,
        offersCommerce: true,
        offersArts: false,
        topCourses: ["B.Com Hons", "BBA", "BMS"],
        seatsScience: undefined,
        seatsCommerce: 220,
        seatsArts: undefined,
        lastDate: now + oneMonth * 0.9,
      },
      {
        name: "State Institute of Commerce",
        city: "Ahmedabad",
        state: "Gujarat",
        officialUrl: "https://www.example.edu/sic",
        offersScience: false,
        offersCommerce: true,
        offersArts: false,
        topCourses: ["B.Com Accounts", "B.Com Finance", "BBA"],
        seatsScience: undefined,
        seatsCommerce: 200,
        seatsArts: undefined,
        lastDate: now + oneMonth * 1.2,
      },
      {
        name: "Delhi School of Commerce",
        city: "New Delhi",
        state: "Delhi",
        officialUrl: "https://www.example.edu/dsc",
        offersScience: false,
        offersCommerce: true,
        offersArts: false,
        topCourses: ["B.Com Hons", "BBA(FIA)", "B.Com Taxation"],
        seatsScience: undefined,
        seatsCommerce: 230,
        seatsArts: undefined,
        lastDate: now + oneMonth * 1.1,
      },
      {
        name: "Bengal Institute of Management & Commerce",
        city: "Kolkata",
        state: "West Bengal",
        officialUrl: "https://www.example.edu/bimc",
        offersScience: false,
        offersCommerce: true,
        offersArts: false,
        topCourses: ["B.Com Marketing", "B.Com Finance", "BBA"],
        seatsScience: undefined,
        seatsCommerce: 190,
        seatsArts: undefined,
        lastDate: now + oneMonth * 1.3,
      },
      {
        name: "Chennai Government Commerce College",
        city: "Chennai",
        state: "Tamil Nadu",
        officialUrl: "https://www.example.edu/cgcc",
        offersScience: false,
        offersCommerce: true,
        offersArts: false,
        topCourses: ["B.Com Economics", "B.Com Hons", "BBA"],
        seatsScience: undefined,
        seatsCommerce: 210,
        seatsArts: undefined,
        lastDate: now + oneMonth * 0.95,
      },
      {
        name: "Kerala College of Commerce",
        city: "Kochi",
        state: "Kerala",
        officialUrl: "https://www.example.edu/kcc",
        offersScience: false,
        offersCommerce: true,
        offersArts: false,
        topCourses: ["B.Com Banking", "B.Com Analytics", "BBA"],
        seatsScience: undefined,
        seatsCommerce: 180,
        seatsArts: undefined,
        lastDate: now + oneMonth * 1.5,
      },
      {
        name: "Rajasthan Govt. College of Business",
        city: "Jaipur",
        state: "Rajasthan",
        officialUrl: "https://www.example.edu/rgcb",
        offersScience: false,
        offersCommerce: true,
        offersArts: false,
        topCourses: ["B.Com Hons", "BBA", "B.Com Accounting"],
        seatsScience: undefined,
        seatsCommerce: 170,
        seatsArts: undefined,
        lastDate: now + oneMonth * 1.7,
      },
      {
        name: "Punjab Commerce Institute",
        city: "Ludhiana",
        state: "Punjab",
        officialUrl: "https://www.example.edu/pci",
        offersScience: false,
        offersCommerce: true,
        offersArts: false,
        topCourses: ["B.Com Taxation", "B.Com Banking", "BBA"],
        seatsScience: undefined,
        seatsCommerce: 160,
        seatsArts: undefined,
        lastDate: now + oneMonth * 1.1,
      },
      {
        name: "Madhya Pradesh Commerce College",
        city: "Bhopal",
        state: "Madhya Pradesh",
        officialUrl: "https://www.example.edu/mpcc",
        offersScience: false,
        offersCommerce: true,
        offersArts: false,
        topCourses: ["B.Com Finance", "B.Com Hons", "BBA"],
        seatsScience: undefined,
        seatsCommerce: 150,
        seatsArts: undefined,
        lastDate: now + oneMonth * 1.4,
      },
      {
        name: "Telangana Govt. Business College",
        city: "Hyderabad",
        state: "Telangana",
        officialUrl: "https://www.example.edu/tgbc",
        offersScience: false,
        offersCommerce: true,
        offersArts: false,
        topCourses: ["B.Com Computer Applications", "BBA", "B.Com Hons"],
        seatsScience: undefined,
        seatsCommerce: 200,
        seatsArts: undefined,
        lastDate: now + oneMonth * 1.6,
      },

      // Arts (10)
      {
        name: "Government College of Arts & Humanities",
        city: "New Delhi",
        state: "Delhi",
        officialUrl: "https://www.example.edu/gcah",
        offersScience: false,
        offersCommerce: false,
        offersArts: true,
        topCourses: ["BA History", "BA Political Science", "BA Psychology"],
        seatsScience: undefined,
        seatsCommerce: undefined,
        seatsArts: 200,
        lastDate: now + oneMonth * 1.2,
      },
      {
        name: "State Institute of Liberal Arts",
        city: "Mumbai",
        state: "Maharashtra",
        officialUrl: "https://www.example.edu/sila",
        offersScience: false,
        offersCommerce: false,
        offersArts: true,
        topCourses: ["BA Economics", "BA Sociology", "BA English"],
        seatsScience: undefined,
        seatsCommerce: undefined,
        seatsArts: 220,
        lastDate: now + oneMonth * 0.85,
      },
      {
        name: "Kolkata College of Arts",
        city: "Kolkata",
        state: "West Bengal",
        officialUrl: "https://www.example.edu/kca",
        offersScience: false,
        offersCommerce: false,
        offersArts: true,
        topCourses: ["BA Journalism", "BA History", "BA Philosophy"],
        seatsScience: undefined,
        seatsCommerce: undefined,
        seatsArts: 180,
        lastDate: now + oneMonth * 1.3,
      },
      {
        name: "Chennai Govt. Humanities College",
        city: "Chennai",
        state: "Tamil Nadu",
        officialUrl: "https://www.example.edu/cghc",
        offersScience: false,
        offersCommerce: false,
        offersArts: true,
        topCourses: ["BA Political Science", "BA English", "BA Psychology"],
        seatsScience: undefined,
        seatsCommerce: undefined,
        seatsArts: 190,
        lastDate: now + oneMonth * 1.1,
      },
      {
        name: "Kerala Institute of Arts",
        city: "Kochi",
        state: "Kerala",
        officialUrl: "https://www.example.edu/kia",
        offersScience: false,
        offersCommerce: false,
        offersArts: true,
        topCourses: ["BA Malayalam", "BA Journalism", "BA Sociology"],
        seatsScience: undefined,
        seatsCommerce: undefined,
        seatsArts: 150,
        lastDate: now + oneMonth * 1.6,
      },
      {
        name: "Rajasthan School of Fine Arts",
        city: "Jaipur",
        state: "Rajasthan",
        officialUrl: "https://www.example.edu/rsfa",
        offersScience: false,
        offersCommerce: false,
        offersArts: true,
        topCourses: ["BA Fine Arts", "BA History", "BA Geography"],
        seatsScience: undefined,
        seatsCommerce: undefined,
        seatsArts: 160,
        lastDate: now + oneMonth * 1.8,
      },
      {
        name: "Punjab College of Arts",
        city: "Patiala",
        state: "Punjab",
        officialUrl: "https://www.example.edu/pca",
        offersScience: false,
        offersCommerce: false,
        offersArts: true,
        topCourses: ["BA Music", "BA Dance", "BA English"],
        seatsScience: undefined,
        seatsCommerce: undefined,
        seatsArts: 170,
        lastDate: now + oneMonth * 1.4,
      },
      {
        name: "Madhya Pradesh Humanities College",
        city: "Indore",
        state: "Madhya Pradesh",
        officialUrl: "https://www.example.edu/mphc",
        offersScience: false,
        offersCommerce: false,
        offersArts: true,
        topCourses: ["BA Psychology", "BA Political Science", "BA Journalism"],
        seatsScience: undefined,
        seatsCommerce: undefined,
        seatsArts: 140,
        lastDate: now + oneMonth * 1.2,
      },
      {
        name: "Telangana School of Liberal Arts",
        city: "Hyderabad",
        state: "Telangana",
        officialUrl: "https://www.example.edu/tsla",
        offersScience: false,
        offersCommerce: false,
        offersArts: true,
        topCourses: ["BA Economics", "BA English", "BA Sociology"],
        seatsScience: undefined,
        seatsCommerce: undefined,
        seatsArts: 210,
        lastDate: now + oneMonth * 1.0,
      },
      {
        name: "Bihar Government Arts College",
        city: "Patna",
        state: "Bihar",
        officialUrl: "https://www.example.edu/bgac",
        offersScience: false,
        offersCommerce: false,
        offersArts: true,
        topCourses: ["BA History", "BA Geography", "BA Philosophy"],
        seatsScience: undefined,
        seatsCommerce: undefined,
        seatsArts: 130,
        lastDate: now + oneMonth * 1.5,
      },
    ];

    for (const d of data) {
      await ctx.db.insert("governmentColleges", d);
    }

    return "seeded";
  },
});