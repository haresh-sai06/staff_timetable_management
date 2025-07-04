import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("subjects").filter((q) => q.eq(q.field("isActive"), true)).collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    code: v.string(),
    department: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated");
    }

    return await ctx.db.insert("subjects", {
      ...args,
      isActive: true,
    });
  },
});
