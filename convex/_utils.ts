import { QueryCtx, MutationCtx } from "./_generated/server";

// Get the current authenticated user's identity
export async function getViewer(ctx: QueryCtx | MutationCtx) {
  return await ctx.auth.getUserIdentity();
}

// Get user document from database by Clerk ID
export async function getUser(ctx: QueryCtx | MutationCtx) {
  const identity = await getViewer(ctx);
  if (!identity) {
    return null;
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
    .unique();

  return user;
}

// Require authentication - throws error if not authenticated
export async function requireUser(ctx: QueryCtx | MutationCtx) {
  const user = await getUser(ctx);
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}

// Require specific role(s) - throws error if user doesn't have required role
export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  allowedRoles: Array<"student" | "instructor" | "admin">
) {
  const user = await requireUser(ctx);
  
  if (!allowedRoles.includes(user.role)) {
    throw new Error(`Access denied. Required roles: ${allowedRoles.join(", ")}`);
  }
  
  return user;
}

// Generate a URL-friendly slug from a title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}