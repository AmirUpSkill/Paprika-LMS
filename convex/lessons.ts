import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireRole } from "./_utils";


export const createLesson = mutation({
  args: {
    chapterId: v.id("chapters"),
    title: v.string(),
    description: v.optional(v.string()),
    duration: v.number(),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["instructor", "admin"]);

    const chapter = await ctx.db.get(args.chapterId);
    if (!chapter) throw new Error("Chapter not found");

    const course = await ctx.db.get(chapter.courseId);
    if (!course) throw new Error("Course not found");

    if (user.role === "instructor" && course.instructorId !== user._id) {
      throw new Error("You can only modify your own courses");
    }

    // Get the highest order index
    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_chapter", (q) => q.eq("chapterId", args.chapterId))
      .collect();

    const maxOrder = Math.max(0, ...lessons.map((l) => l.orderIndex));

    const lessonId = await ctx.db.insert("lessons", {
      chapterId: args.chapterId,
      courseId: chapter.courseId, // Denormalized
      title: args.title,
      description: args.description,
      duration: args.duration,
      orderIndex: maxOrder + 1,
      content: args.content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { _id: lessonId };
  },
});
