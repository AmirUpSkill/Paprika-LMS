import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUser, requireRole } from "./_utils";

// Sync user from Clerk webhook
export const syncUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    const now = Date.now();
    
    // Check if email matches admin list (from env variable)
    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
    const role = adminEmails.includes(args.email) ? "admin" : "student";

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
        updatedAt: now,
      });
      return existingUser._id;
    } else {
      // Create new user
      return await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
        role,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// Get current user with stats
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user) return null;

    // Get enrollment count
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const completedCourses = enrollments.filter(
      (e) => e.status === "completed"
    ).length;

    return {
      ...user,
      enrolledCourses: enrollments.length,
      completedCourses,
    };
  },
});

// Update user role (admin only)
export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("student"), v.literal("instructor"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    const currentUser = await requireRole(ctx, ["admin"]);
    
    await ctx.db.patch(args.userId, {
      role: args.role,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get user by Clerk ID (useful for server-side operations)
export const getUserByClerkId = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});