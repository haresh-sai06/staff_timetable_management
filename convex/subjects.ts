import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

async function requireAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Must be authenticated");

  const authUser = await ctx.db.get(userId);
  if (!authUser?.email) throw new Error("User email required");

  const user = await ctx.db
    .query("users")
    .withIndex("by_email", (q: any) => q.eq("email", authUser.email))
    .first();

  if (!user || user.role !== "admin") {
    throw new Error("Admin access required");
  }

  return user;
}

export const list = query({
  args: {
    department: v.optional(v.string()),
    semester: v.optional(v.union(v.literal("odd"), v.literal("even"))),
  },
  handler: async (ctx, args) => {
    let query;

    if (args.department && args.semester) {
      query = ctx.db
        .query("subjects")
        .withIndex("by_department_semester", (q: any) =>
          q.eq("department", args.department).eq("semester", args.semester)
        )
        .filter((q) => q.eq(q.field("isActive"), true));
    } else if (args.department) {
      query = ctx.db
        .query("subjects")
        .filter((q) => q.eq(q.field("isActive"), true))
        .filter((q) => q.eq(q.field("department"), args.department));
    } else {
      query = ctx.db
        .query("subjects")
        .filter((q) => q.eq(q.field("isActive"), true));
    }

    return await query.collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    code: v.string(),
    credits: v.number(),
    semester: v.union(v.literal("odd"), v.literal("even")),
    department: v.string(),
    type: v.union(v.literal("theory"), v.literal("lab")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    return await ctx.db.insert("subjects", {
      ...args,
      isActive: true,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("subjects"),
    name: v.string(),
    code: v.string(),
    credits: v.number(),
    semester: v.union(v.literal("odd"), v.literal("even")),
    department: v.string(),
    type: v.union(v.literal("theory"), v.literal("lab")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const { id, ...updateData } = args;
    await ctx.db.patch(id, updateData);
  },
});

export const remove = mutation({
  args: { id: v.id("subjects") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    await ctx.db.patch(args.id, { isActive: false });
  },
});