import { mutation } from "./_generated/server";
import { getCurrentUser } from "./users";

export const seedDashboardData = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    // Seed progress data
    await ctx.db.insert("progress", {
      userId: user._id,
      subject: "Mathematics",
      currentLevel: 7,
      totalLevels: 10,
      completedMilestones: ["Basic Algebra", "Geometry", "Trigonometry"],
      lastUpdated: Date.now(),
    });

    await ctx.db.insert("progress", {
      userId: user._id,
      subject: "Science",
      currentLevel: 5,
      totalLevels: 8,
      completedMilestones: ["Physics Basics", "Chemistry Intro"],
      lastUpdated: Date.now(),
    });

    // Seed tasks
    await ctx.db.insert("tasks", {
      userId: user._id,
      title: "Complete Math Assignment Chapter 5",
      description: "Solve problems 1-20 on quadratic equations",
      completed: false,
      dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
      priority: "high",
      category: "Mathematics",
    });

    await ctx.db.insert("tasks", {
      userId: user._id,
      title: "Review Science Notes",
      description: "Go through chemistry notes for upcoming test",
      completed: false,
      dueDate: Date.now() + 3 * 24 * 60 * 60 * 1000, // 3 days from now
      priority: "medium",
      category: "Science",
    });

    // Seed goals
    await ctx.db.insert("goals", {
      userId: user._id,
      title: "Improve Math Grade to A",
      description: "Focus on algebra and geometry to boost overall grade",
      targetDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
      completed: false,
      progress: 65,
      category: "Academic",
    });

    await ctx.db.insert("goals", {
      userId: user._id,
      title: "Complete SAT Preparation",
      description: "Finish all practice tests and review materials",
      targetDate: Date.now() + 60 * 24 * 60 * 60 * 1000, // 60 days from now
      completed: false,
      progress: 30,
      category: "Test Prep",
    });

    // Seed scores
    await ctx.db.insert("scores", {
      userId: user._id,
      subject: "Mathematics",
      score: 85,
      maxScore: 100,
      testDate: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
      testType: "Quiz",
    });

    await ctx.db.insert("scores", {
      userId: user._id,
      subject: "Science",
      score: 92,
      maxScore: 100,
      testDate: Date.now() - 14 * 24 * 60 * 60 * 1000, // 14 days ago
      testType: "Exam",
    });

    // Seed study materials
    await ctx.db.insert("studyMaterials", {
      userId: user._id,
      title: "Khan Academy - Algebra Basics",
      description: "Comprehensive algebra tutorial series",
      url: "https://www.khanacademy.org/math/algebra-basics",
      category: "Mathematics",
      tags: ["algebra", "basics", "video"],
    });

    await ctx.db.insert("studyMaterials", {
      userId: user._id,
      title: "Crash Course Chemistry",
      description: "Fun and engaging chemistry video series",
      url: "https://www.youtube.com/playlist?list=PL8dPuuaLjXtPHzzYuWy6fYEaX9mQQ8oGr",
      category: "Science",
      tags: ["chemistry", "video", "basics"],
    });

    // Seed scholarships
    await ctx.db.insert("scholarships", {
      title: "Merit-Based Academic Scholarship",
      description: "Scholarship for students with outstanding academic performance",
      amount: 5000,
      deadline: Date.now() + 45 * 24 * 60 * 60 * 1000, // 45 days from now
      eligibility: ["GPA 3.5+", "Full-time student", "Community service"],
      applicationUrl: "https://example.com/scholarship1",
      category: "Academic",
    });

    await ctx.db.insert("scholarships", {
      title: "STEM Excellence Award",
      description: "Supporting students pursuing STEM fields",
      amount: 7500,
      deadline: Date.now() + 60 * 24 * 60 * 60 * 1000, // 60 days from now
      eligibility: ["STEM major", "GPA 3.0+", "Research experience"],
      applicationUrl: "https://example.com/scholarship2",
      category: "STEM",
    });

    return "Dashboard data seeded successfully!";
  },
});
