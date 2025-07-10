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
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("staff").filter((q) => q.eq(q.field("isActive"), true));
    
    if (args.department) {
      query = query.withIndex("by_department", (q: any) => q.eq("department", args.department));
    }
    
    return await query.collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    department: v.string(),
    institutionRole: v.union(v.literal("Assistant Professor"), v.literal("Professor")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Set max hours based on role
    const maxHours = args.institutionRole === "Assistant Professor" ? 18 : 12;

    return await ctx.db.insert("staff", {
      ...args,
      maxHours,
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

export const getWorkload = query({
  args: {
    staffId: v.id("staff"),
    department: v.string(),
    semester: v.union(v.literal("odd"), v.literal("even")),
  },
  handler: async (ctx, args) => {
    const staff = await ctx.db.get(args.staffId);
    if (!staff) {
      throw new Error("Staff not found");
    }

    const assignments = await ctx.db
      .query("timetableAssignments")
      .withIndex("by_staff", (q: any) => q.eq("staffId", args.staffId))
      .filter((q: any) => 
        q.and(
          q.eq(q.field("department"), args.department),
          q.eq(q.field("semester"), args.semester)
        )
      )
      .collect();

    // Calculate total hours (assuming each slot is 1 hour)
    const totalHours = assignments.length;
    
    return {
      currentHours: totalHours,
      maxHours: staff.maxHours,
      remainingHours: staff.maxHours - totalHours,
      utilizationPercentage: Math.round((totalHours / staff.maxHours) * 100),
    };
  },
});

export const update = mutation({
  args: {
    id: v.id("staff"),
    name: v.string(),
    email: v.string(),
    department: v.string(),
    institutionRole: v.union(v.literal("Assistant Professor"), v.literal("Professor")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const { id, ...updateData } = args;
    const maxHours = updateData.institutionRole === "Assistant Professor" ? 18 : 12;
    
    await ctx.db.patch(id, {
      ...updateData,
      maxHours,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("staff") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    await ctx.db.patch(args.id, { isActive: false });
  },
});