import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
      
      // EduGuide specific fields
      currentCareerGoal: v.optional(v.string()),
      interests: v.optional(v.array(v.string())),
      academicLevel: v.optional(v.string()),
      
      // College profile fields (optional)
      collegeName: v.optional(v.string()),
      collegeLogoUrl: v.optional(v.string()),
      collegeContactInfo: v.optional(v.string()),
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // Progress tracking
    progress: defineTable({
      userId: v.id("users"),
      subject: v.string(),
      currentLevel: v.number(),
      totalLevels: v.number(),
      completedMilestones: v.array(v.string()),
      lastUpdated: v.number(),
    }).index("by_user", ["userId"]),

    // Tasks/To-do items
    tasks: defineTable({
      userId: v.id("users"),
      title: v.string(),
      description: v.optional(v.string()),
      completed: v.boolean(),
      dueDate: v.optional(v.number()),
      priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
      category: v.optional(v.string()),
    }).index("by_user", ["userId"]).index("by_user_completed", ["userId", "completed"]),

    // Goals
    goals: defineTable({
      userId: v.id("users"),
      title: v.string(),
      description: v.optional(v.string()),
      targetDate: v.optional(v.number()),
      completed: v.boolean(),
      progress: v.number(), // 0-100
      category: v.string(),
    }).index("by_user", ["userId"]).index("by_user_completed", ["userId", "completed"]),

    // Academic scores
    scores: defineTable({
      userId: v.id("users"),
      subject: v.string(),
      score: v.number(),
      maxScore: v.number(),
      testDate: v.number(),
      testType: v.string(), // "quiz", "exam", "assignment", etc.
      // Add class and stream support
      classLevel: v.optional(v.union(v.literal("class10"), v.literal("class12"))),
      stream: v.optional(v.union(v.literal("Science"), v.literal("Commerce"), v.literal("Arts"))),
    })
      .index("by_user", ["userId"])
      .index("by_user_subject", ["userId", "subject"])
      // New indexes for class/stream operations
      .index("by_user_and_class", ["userId", "classLevel"])
      .index("by_user_class_and_subject", ["userId", "classLevel", "subject"])
      .index("by_user_class_stream_subject", ["userId", "classLevel", "stream", "subject"]),

    // Study materials
    studyMaterials: defineTable({
      userId: v.id("users"),
      title: v.string(),
      description: v.optional(v.string()),
      url: v.string(),
      category: v.string(),
      tags: v.optional(v.array(v.string())),
    }).index("by_user", ["userId"]).index("by_category", ["category"]),

    // Scholarships
    scholarships: defineTable({
      title: v.string(),
      description: v.string(),
      amount: v.number(),
      deadline: v.number(),
      eligibility: v.array(v.string()),
      applicationUrl: v.string(),
      category: v.string(),
    }).index("by_deadline", ["deadline"]).index("by_category", ["category"]),

    // Government colleges directory
    governmentColleges: defineTable({
      name: v.string(),
      city: v.string(),
      state: v.string(),
      officialUrl: v.string(),
      offersScience: v.boolean(),
      offersCommerce: v.boolean(),
      offersArts: v.boolean(),
      topCourses: v.array(v.string()),
      seatsScience: v.optional(v.number()),
      seatsCommerce: v.optional(v.number()),
      seatsArts: v.optional(v.number()),
      lastDate: v.number(), // application deadline
    })
      .index("by_offersScience", ["offersScience"])
      .index("by_offersCommerce", ["offersCommerce"])
      .index("by_offersArts", ["offersArts"])
      .index("by_lastDate", ["lastDate"]),

    // Add a new table to track college vacant seats
    vacantSeats: defineTable({
      userId: v.id("users"),
      collegeName: v.string(),
      branch: v.string(),
      seats: v.number(),
      lastDate: v.number(), // ms since epoch
      notes: v.optional(v.string()),
    })
      .index("by_user", ["userId"])
      .index("by_branch", ["branch"])
      .index("by_lastDate", ["lastDate"]),

    // Applications submitted to a college (owned by college user)
    applications: defineTable({
      userId: v.id("users"),
      studentName: v.string(),
      branch: v.string(),
      meritRank: v.number(),
      category: v.optional(v.string()), // e.g., General/OBC/SC/ST
      contactEmail: v.optional(v.string()),
      contactPhone: v.optional(v.string()),
      notes: v.optional(v.string()),
    })
      .index("by_user", ["userId"])
      .index("by_user_branch", ["userId", "branch"]),

    // Merit list per branch (one per branch per college user ideally)
    meritLists: defineTable({
      userId: v.id("users"),
      branch: v.string(),
      details: v.string(), // free text / markdown
      lastUpdated: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_user_branch", ["userId", "branch"]),

    // Announcements to students
    announcements: defineTable({
      userId: v.id("users"),
      message: v.string(),
      branch: v.optional(v.string()), // optional target branch (undefined = all)
      createdAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_user_branch", ["userId", "branch"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;