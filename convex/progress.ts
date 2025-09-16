import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireUser } from "./_utils";

// Mark lesson as complete
export const markLessonComplete = mutation({
  args: {
    lessonId: v.id("lessons"),
    watchTime: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    // Validate lesson
    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) throw new Error("Lesson not found");

    // Check enrollment
    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", user._id).eq("courseId", lesson.courseId)
      )
      .unique();

    if (!enrollment) {
      throw new Error("Not enrolled in this course");
    }

    // Check existing progress
    const existingProgress = await ctx.db
      .query("progress")
      .withIndex("by_user_lesson", (q) =>
        q.eq("userId", user._id).eq("lessonId", args.lessonId)
      )
      .unique();

    if (existingProgress) {
      await ctx.db.patch(existingProgress._id, {
        completed: true,
        watchTime: args.watchTime,
        completedAt: Date.now(),
        lastWatchedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("progress", {
        userId: user._id,
        lessonId: args.lessonId,
        courseId: lesson.courseId,
        completed: true,
        watchTime: args.watchTime,
        completedAt: Date.now(),
        lastWatchedAt: Date.now(),
      });
    }

    // Update enrollment last accessed
    await ctx.db.patch(enrollment._id, {
      lastAccessedAt: Date.now(),
    });

    // Track analytics
    await ctx.db.insert("analytics", {
      eventType: "lesson_complete",
      userId: user._id,
      courseId: lesson.courseId,
      lessonId: args.lessonId,
      timestamp: Date.now(),
    });

    // Calculate course completion
    const allLessons = await ctx.db
      .query("lessons")
      .withIndex("by_course", (q) => q.eq("courseId", lesson.courseId))
      .collect();

    const completedLessons = await ctx.db
      .query("progress")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", user._id).eq("courseId", lesson.courseId)
      )
      .filter((q) => q.eq(q.field("completed"), true))
      .collect();

    const percentComplete = Math.round(
      (completedLessons.length / allLessons.length) * 100
    );

    // If course is 100% complete, update enrollment
    if (percentComplete === 100) {
      await ctx.db.patch(enrollment._id, {
        status: "completed",
        completedAt: Date.now(),
      });
    }

    return {
      success: true,
      courseProgress: {
        completedLessons: completedLessons.length,
        totalLessons: allLessons.length,
        percentComplete,
      },
    };
  },
});
