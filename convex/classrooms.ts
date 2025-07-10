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
    type: v.optional(v.union(v.literal("lecture_hall"), v.literal("lab"), v.literal("seminar_room"))),
    department: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("classrooms").filter((q) => q.eq(q.field("isActive"), true));
    
    if (args.type) {
      query = query.filter((q) => q.eq(q.field("type"), args.type));
    }
    
    if (args.department) {
      query = query.filter((q) => q.eq(q.field("department"), args.department));
    }
    
    return await query.collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    capacity: v.number(),
    type: v.union(v.literal("lecture_hall"), v.literal("lab"), v.literal("seminar_room")),
    department: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    return await ctx.db.insert("classrooms", {
      ...args,
      isActive: true,
    });
  },
});

export const checkAvailability = query({
  args: {
    classroomId: v.id("classrooms"),
    day: v.string(),
    timeSlot: v.string(),
    excludeId: v.optional(v.id("timetableAssignments")),
  },
  handler: async (ctx, args) => {
    const existingAssignment = await ctx.db
      .query("timetableAssignments")
      .withIndex("by_classroom_day_time", (q: any) =>
        q.eq("classroomId", args.classroomId).eq("day", args.day).eq("timeSlot", args.timeSlot)
      )
      .first();

    if (!existingAssignment) {
      return { isAvailable: true };
    }

    if (args.excludeId && existingAssignment._id === args.excludeId) {
      return { isAvailable: true };
    }

    const subject = await ctx.db.get(existingAssignment.subjectId);
    const staff = await ctx.db.get(existingAssignment.staffId);
    
    return {
      isAvailable: false,
      conflictWith: {
        subject: subject?.name || "Unknown",
        staff: staff?.name || "Unknown",
        department: existingAssignment.department,
      },
    };
  },
});

export const update = mutation({
  args: {
    id: v.id("classrooms"),
    name: v.string(),
    capacity: v.number(),
    type: v.union(v.literal("lecture_hall"), v.literal("lab"), v.literal("seminar_room")),
    department: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const { id, ...updateData } = args;
    await ctx.db.patch(id, updateData);
  },
});

export const remove = mutation({
  args: { id: v.id("classrooms") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    await ctx.db.patch(args.id, { isActive: false });
  },
});