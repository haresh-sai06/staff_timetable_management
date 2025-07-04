import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("staff").filter((q) => q.eq(q.field("isActive"), true)).collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    department: v.string(),
    maxPeriodsPerDay: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated");
    }

    return await ctx.db.insert("staff", {
      ...args,
      isActive: true,
    });
  },
});

export const getById = query({
  args: { id: v.id("staff") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
