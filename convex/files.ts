import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireRole } from "./_utils";

// Generate upload URL for any file
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireRole(ctx, ["instructor", "admin"]);
    
    // Generate a storage upload URL
    return await ctx.storage.generateUploadUrl();
  },
});

// Attach thumbnail to course
export const attachThumbnailToCourse = mutation({
  args: {
    courseId: v.id("courses"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["instructor", "admin"]);
    
    const course = await ctx.db.get(args.courseId);
    if (!course) throw new Error("Course not found");
    
    // Check ownership
    if (user.role === "instructor" && course.instructorId !== user._id) {
      throw new Error("You can only modify your own courses");
    }

    // Delete old thumbnail if exists
    if (course.thumbnailId) {
      await ctx.storage.delete(course.thumbnailId);
    }

    await ctx.db.patch(args.courseId, {
      thumbnailId: args.storageId,
      updatedAt: Date.now(),
    });

    const url = await ctx.storage.getUrl(args.storageId);
    return { success: true, thumbnailUrl: url };
  },
});

// Attach video to lesson
export const attachVideoToLesson = mutation({
  args: {
    lessonId: v.id("lessons"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["instructor", "admin"]);
    
    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) throw new Error("Lesson not found");
    
    const course = await ctx.db.get(lesson.courseId);
    if (!course) throw new Error("Course not found");
    
    // Check ownership
    if (user.role === "instructor" && course.instructorId !== user._id) {
      throw new Error("You can only modify your own courses");
    }

    // Delete old video if exists
    if (lesson.videoId) {
      await ctx.storage.delete(lesson.videoId);
    }

    await ctx.db.patch(args.lessonId, {
      videoId: args.storageId,
      updatedAt: Date.now(),
    });

    const url = await ctx.storage.getUrl(args.storageId);
    return { success: true, videoUrl: url };
  },
});