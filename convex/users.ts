import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createUser = mutation({
  args: {
    email: v.string(),
    role: v.optional(v.union(v.literal("user"), v.literal("admin"))),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", {
      ...args,
      role: args.role || "user",
    });
  },
});

export const ensureUser = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const authUser = await ctx.db.get(userId);
    if (!authUser?.email) throw new Error("User email required");

    let user = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", authUser.email))
      .first();

    if (!user) {
      const newUserId = await ctx.db.insert("users", {
        email: authUser.email,
        role: "user",
        name: authUser.name,
      });
      user = await ctx.db.get(newUserId);
    }

    if (user && !user.role) {
      await ctx.db.patch(user._id, { role: "user" });
    }

    return user;
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    
    const authUser = await ctx.db.get(userId);
    if (!authUser) return null;

    // Check if user exists in our users table
    let user = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", authUser.email || ""))
      .first();



    return user;
  },
});

export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    const authUser = await ctx.db.get(currentUserId);
    if (!authUser?.email) throw new Error("User email required");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", authUser.email))
      .first();

    if (!currentUser || (currentUser.role !== "admin")) {
      throw new Error("Admin access required");
    }

    await ctx.db.patch(args.userId, { role: args.role });
  },
});

export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    const authUser = await ctx.db.get(userId);
    if (!authUser?.email) return false;

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", authUser.email))
      .first();

    return user?.role === "admin";
  },
});
