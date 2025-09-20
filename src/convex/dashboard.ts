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
