import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole, generateSlug } from "./_utils";

// Create a new course
export const createCourse = mutation({
  args: {
    title: v.string(),
    slug: v.optional(v.string()),
    smallDescription: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("Development"),
      v.literal("Design"),
      v.literal("Marketing"),
      v.literal("Business")
    ),
    level: v.union(
      v.literal("Beginner"),
      v.literal("Intermediate"),
      v.literal("Advanced")
    ),
    duration: v.number(),
    price: v.number(),
    keywords: v.optional(v.array(v.string())),
    year: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["instructor", "admin"]);
    
    const now = Date.now();
    const slug = args.slug || generateSlug(args.title);
    
    // Check if slug already exists
    const existingCourse = await ctx.db
      .query("courses")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    
    if (existingCourse) {
      throw new Error("A course with this slug already exists");
    }

    const courseId = await ctx.db.insert("courses", {
      title: args.title,
      slug,
      smallDescription: args.smallDescription,
      description: args.description,
      category: args.category,
      level: args.level,
      duration: args.duration,
      price: args.price,
      status: "draft",
      instructorId: user._id,
      keywords: args.keywords || [],
      year: args.year || new Date().getFullYear(),
      createdAt: now,
      updatedAt: now,
    });

    return { _id: courseId, slug };
  },
});

// Update course
export const updateCourse = mutation({
  args: {
    courseId: v.id("courses"),
    title: v.optional(v.string()),
    smallDescription: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.union(
      v.literal("Development"),
      v.literal("Design"),
      v.literal("Marketing"),
      v.literal("Business")
    )),
    level: v.optional(v.union(
      v.literal("Beginner"),
      v.literal("Intermediate"),
      v.literal("Advanced")
    )),
    duration: v.optional(v.number()),
    price: v.optional(v.number()),
    keywords: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["instructor", "admin"]);
    
    const course = await ctx.db.get(args.courseId);
    if (!course) throw new Error("Course not found");
    
    // Check ownership
    if (user.role === "instructor" && course.instructorId !== user._id) {
      throw new Error("You can only edit your own courses");
    }

    const { courseId, ...updateData } = args;
    
    await ctx.db.patch(courseId, {
      ...updateData,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Publish/Unpublish course
export const updateCourseStatus = mutation({
  args: {
    courseId: v.id("courses"),
    status: v.union(v.literal("draft"), v.literal("published")),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["instructor", "admin"]);
    
    const course = await ctx.db.get(args.courseId);
    if (!course) throw new Error("Course not found");
    
    // Check ownership
    if (user.role === "instructor" && course.instructorId !== user._id) {
      throw new Error("You can only modify your own courses");
    }

    // If publishing, check if course has at least one chapter with lessons
    if (args.status === "published") {
      const chapters = await ctx.db
        .query("chapters")
        .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
        .collect();
      
      if (chapters.length === 0) {
        throw new Error("Cannot publish course without chapters");
      }

      // Check if each chapter has at least one lesson
      for (const chapter of chapters) {
        const lessons = await ctx.db
          .query("lessons")
          .withIndex("by_chapter", (q) => q.eq("chapterId", chapter._id))
          .first();
        
        if (!lessons) {
          throw new Error("All chapters must have at least one lesson before publishing");
        }
      }
    }

    await ctx.db.patch(args.courseId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get instructor's courses
export const getInstructorCourses = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireRole(ctx, ["instructor", "admin"]);
    
    const courses = await ctx.db
      .query("courses")
      .withIndex("by_instructor", (q) => q.eq("instructorId", user._id))
      .order("desc")
      .collect();

    // Get enrollment counts for each course
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        const enrollments = await ctx.db
          .query("enrollments")
          .withIndex("by_course", (q) => q.eq("courseId", course._id))
          .collect();

        const chapters = await ctx.db
          .query("chapters")
          .withIndex("by_course", (q) => q.eq("courseId", course._id))
          .collect();

        const lessonCounts = await Promise.all(
          chapters.map(async (chapter) => {
            const lessons = await ctx.db
              .query("lessons")
              .withIndex("by_chapter", (q) => q.eq("chapterId", chapter._id))
              .collect();
            return lessons.length;
          })
        );

        const totalLessons = lessonCounts.reduce((sum, count) => sum + count, 0);

        return {
          ...course,
          enrollmentCount: enrollments.length,
          chapterCount: chapters.length,
          lessonCount: totalLessons,
          revenue: enrollments.length * course.price,
        };
      })
    );

    return coursesWithStats;
  },
});