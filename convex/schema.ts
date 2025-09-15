import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users synced from Clerk
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    role: v.union(v.literal("student"), v.literal("instructor"), v.literal("admin")),
    bio: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  // Main course table
  courses: defineTable({
    title: v.string(),
    slug: v.string(),
    smallDescription: v.string(),
    description: v.string(), // Rich HTML content
    thumbnailId: v.optional(v.id("_storage")),
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
    duration: v.number(), // hours
    price: v.number(), // cents
    status: v.union(v.literal("draft"), v.literal("published")),
    instructorId: v.id("users"),
    keywords: v.array(v.string()),
    year: v.optional(v.number()), // For the year badges
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_instructor", ["instructorId"])
    .index("by_category_level", ["category", "level"]),

  // Course chapters
  chapters: defineTable({
    courseId: v.id("courses"),
    title: v.string(),
    description: v.optional(v.string()),
    orderIndex: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_course", ["courseId"])
    .index("by_course_order", ["courseId", "orderIndex"]),

  // Individual lessons
  lessons: defineTable({
    chapterId: v.id("chapters"),
    courseId: v.id("courses"), // Denormalized for easier queries
    title: v.string(),
    description: v.optional(v.string()),
    videoId: v.optional(v.id("_storage")),
    duration: v.number(), // minutes
    orderIndex: v.number(),
    content: v.optional(v.string()), // Additional markdown/HTML content
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_chapter", ["chapterId"])
    .index("by_course", ["courseId"])
    .index("by_chapter_order", ["chapterId", "orderIndex"]),

  // Student enrollments
  enrollments: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    paymentId: v.optional(v.string()), // Stripe payment ID
    enrolledAt: v.number(),
    completedAt: v.optional(v.number()),
    lastAccessedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_course", ["courseId"])
    .index("by_user_course", ["userId", "courseId"]),

  // Progress tracking
  progress: defineTable({
    userId: v.id("users"),
    lessonId: v.id("lessons"),
    courseId: v.id("courses"), // Denormalized
    completed: v.boolean(),
    watchTime: v.number(), // seconds
    completedAt: v.optional(v.number()),
    lastWatchedAt: v.number(),
  })
    .index("by_user_lesson", ["userId", "lessonId"])
    .index("by_user_course", ["userId", "courseId"]),

  // Analytics events
  analytics: defineTable({
    eventType: v.union(
      v.literal("page_view"),
      v.literal("course_view"),
      v.literal("lesson_start"),
      v.literal("lesson_complete"),
      v.literal("enrollment")
    ),
    userId: v.optional(v.id("users")),
    courseId: v.optional(v.id("courses")),
    lessonId: v.optional(v.id("lessons")),
    metadata: v.optional(v.any()),
    timestamp: v.number(),
  })
    .index("by_type", ["eventType"])
    .index("by_timestamp", ["timestamp"]),
});