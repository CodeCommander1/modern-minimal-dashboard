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