import { v } from "convex/values";
import { query } from "./_generated/server";

//
// Get all published courses
//
export const getPublishedCourses = query({
  args: {
    category: v.optional(v.string()),
    level: v.optional(v.string()),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let coursesQuery = ctx.db
      .query("courses")
      .withIndex("by_status", (q) => q.eq("status", "published"));

    const courses = await coursesQuery.collect();

    // Filter by category and level if provided
    let filteredCourses = courses;

    if (args.category) {
      filteredCourses = filteredCourses.filter(
        (c) => c.category === args.category
      );
    }

    if (args.level) {
      filteredCourses = filteredCourses.filter((c) => c.level === args.level);
    }

    if (args.search) {
      const searchLower = args.search.toLowerCase();
      filteredCourses = filteredCourses.filter(
        (c) =>
          c.title.toLowerCase().includes(searchLower) ||
          c.smallDescription.toLowerCase().includes(searchLower) ||
          c.keywords.some((k) => k.toLowerCase().includes(searchLower))
      );
    }

    // Sort by creation date (newest first)
    filteredCourses.sort((a, b) => b.createdAt - a.createdAt);

    // Apply limit
    if (args.limit) {
      filteredCourses = filteredCourses.slice(0, args.limit);
    }

    // Fetch instructor info and thumbnail URLs
    const coursesWithDetails = await Promise.all(
      filteredCourses.map(async (course) => {
        const instructor = await ctx.db.get(course.instructorId);
        const thumbnailUrl = course.thumbnailId
          ? await ctx.storage.getUrl(course.thumbnailId)
          : null;

        return {
          ...course,
          thumbnailUrl,
          instructor: instructor
            ? {
                name: instructor.name || "Unknown Instructor",
                imageUrl: instructor.imageUrl,
              }
            : null,
        };
      })
    );

    return coursesWithDetails;
  },
});

//
// Get course details by slug
//
export const getCourseBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const course = await ctx.db
      .query("courses")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!course || course.status !== "published") {
      return null;
    }

    const instructor = await ctx.db.get(course.instructorId);
    const thumbnailUrl = course.thumbnailId
      ? await ctx.storage.getUrl(course.thumbnailId)
      : null;

    // Get chapters with lessons
    const chapters = await ctx.db
      .query("chapters")
      .withIndex("by_course_order", (q) => q.eq("courseId", course._id))
      .collect();

    const curriculum = await Promise.all(
      chapters.map(async (chapter) => {
        const lessons = await ctx.db
          .query("lessons")
          .withIndex("by_chapter_order", (q) => q.eq("chapterId", chapter._id))
          .collect();

        return {
          ...chapter,
          lessons: lessons.map((lesson) => ({
            _id: lesson._id,
            title: lesson.title,
            duration: lesson.duration,
          })),
        };
      })
    );

    // Calculate totals
    const totalLessons = curriculum.reduce(
      (sum, ch) => sum + ch.lessons.length,
      0
    );

    const totalDuration = curriculum.reduce(
      (sum, ch) =>
        sum + ch.lessons.reduce((lSum, l) => lSum + l.duration, 0),
      0
    );

    return {
      ...course,
      thumbnailUrl,
      instructor: instructor
        ? {
            _id: instructor._id,
            name: instructor.name || "Unknown Instructor",
            bio: instructor.bio,
            imageUrl: instructor.imageUrl,
          }
        : null,
      curriculum,
      totalLessons,
      totalDuration: Math.ceil(totalDuration / 60), // Convert to hours
    };
  },
});
