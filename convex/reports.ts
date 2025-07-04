import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: {
    issueType: v.string(),
    description: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be authenticated");

    const authUser = await ctx.db.get(userId);
    if (!authUser?.email) throw new Error("User email required");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", authUser.email))
      .first();

    if (!user) throw new Error("User not found");

    return await ctx.db.insert("reports", {
      userId: user._id,
      issueType: args.issueType,
      description: args.description,
      reason: args.reason,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const authUser = await ctx.db.get(userId);
    if (!authUser?.email) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", authUser.email))
      .first();

    if (!user) return [];

    // If admin, return all reports with user details
    if (user.role === "admin") {
      const reports = await ctx.db.query("reports").order("desc").collect();
      return Promise.all(
        reports.map(async (report) => {
          const reportUser = await ctx.db.get(report.userId);
          return {
            ...report,
            userName: reportUser?.name || reportUser?.email || "Unknown",
          };
        })
      );
    }

    // If user, return only their reports
    return await ctx.db
      .query("reports")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const updateStatus = mutation({
  args: {
    reportId: v.id("reports"),
    status: v.union(v.literal("pending"), v.literal("resolved")),
  },
  handler: async (ctx, args) => {
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

    const updateData: any = { status: args.status };
    if (args.status === "resolved") {
      updateData.resolvedAt = Date.now();
      updateData.resolvedBy = user._id;
    }

    await ctx.db.patch(args.reportId, updateData);
  },
});
