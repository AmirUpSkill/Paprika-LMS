import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireRole } from "./_utils";

// Create chapter
export const createChapter = mutation({
  args: {
    courseId: v.id("courses"),
    title: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["instructor", "admin"]);

    const course = await ctx.db.get(args.courseId);
    if (!course) throw new Error("Course not found");

    if (user.role === "instructor" && course.instructorId !== user._id) {
      throw new Error("You can only modify your own courses");
    }

    // Get the highest order index
    const chapters = await ctx.db
      .query("chapters")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    const maxOrder = Math.max(0, ...chapters.map(c => c.orderIndex));

    const chapterId = await ctx.db.insert("chapters", {
      courseId: args.courseId,
      title: args.title,
      description: args.description,
      orderIndex: maxOrder + 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { _id: chapterId };
  },
});

// Reorder chapters
export const reorderChapters = mutation({
  args: {
    courseId: v.id("courses"),
    chapterIds: v.array(v.id("chapters")),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["instructor", "admin"]);

    const course = await ctx.db.get(args.courseId);
    if (!course) throw new Error("Course not found");

    if (user.role === "instructor" && course.instructorId !== user._id) {
      throw new Error("You can only modify your own courses");
    }

    // Update order for each chapter
    await Promise.all(
      args.chapterIds.map((chapterId, index) =>
        ctx.db.patch(chapterId, {
          orderIndex: index,
          updatedAt: Date.now(),
        })
      )
    );

    return { success: true };
  },
});
