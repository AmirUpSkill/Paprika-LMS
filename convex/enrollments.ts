import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./_utils";

//
// Create enrollment (for now, free enrollment)
//
export const createEnrollment = mutation({
  args: {
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    // Check if already enrolled
    const existingEnrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", user._id).eq("courseId", args.courseId)
      )
      .unique();

    if (existingEnrollment) {
      throw new Error("Already enrolled in this course");
    }

    // Ensure course exists and is published
    const course = await ctx.db.get(args.courseId);
    if (!course || course.status !== "published") {
      throw new Error("Course not available");
    }

    // Create enrollment record
    const enrollmentId = await ctx.db.insert("enrollments", {
      userId: user._id,
      courseId: args.courseId,
      status: "active",
      enrolledAt: Date.now(),
    });

    // Track analytics event
    await ctx.db.insert("analytics", {
      eventType: "enrollment",
      userId: user._id,
      courseId: args.courseId,
      timestamp: Date.now(),
    });

    return { _id: enrollmentId };
  },
});

//
// Get user's enrolled courses
//
export const getUserEnrollments = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);

    // Get all enrollments of this user
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    // Enrich with course + progress details
    const enrollmentsWithDetails = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await ctx.db.get(enrollment.courseId);
        if (!course) return null;

        // Thumbnail
        const thumbnailUrl = course.thumbnailId
          ? await ctx.storage.getUrl(course.thumbnailId)
          : null;

        // All lessons of the course
        const allLessons = await ctx.db
          .query("lessons")
          .withIndex("by_course", (q) => q.eq("courseId", course._id))
          .collect();

        // Completed lessons
        const completedProgress = await ctx.db
          .query("progress")
          .withIndex("by_user_course", (q) =>
            q.eq("userId", user._id).eq("courseId", course._id)
          )
          .filter((q) => q.eq(q.field("completed"), true))
          .collect();

        // Calculate percentage
        const percentComplete =
          allLessons.length > 0
            ? Math.round((completedProgress.length / allLessons.length) * 100)
            : 0;

        return {
          ...enrollment,
          course: {
            _id: course._id,
            title: course.title,
            slug: course.slug,
            thumbnailUrl,
            totalLessons: allLessons.length,
            level: course.level,
            duration: course.duration,
          },
          progress: {
            completedLessons: completedProgress.length,
            percentComplete,
            lastAccessedAt: enrollment.lastAccessedAt,
          },
        };
      })
    );

    // Remove nulls (in case some courses got deleted)
    return enrollmentsWithDetails.filter((e) => e !== null);
  },
});
