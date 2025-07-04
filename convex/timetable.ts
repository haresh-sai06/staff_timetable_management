import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const assignments = await ctx.db.query("timetableAssignments").collect();
    
    // Enrich with staff and subject details
    const enrichedAssignments = await Promise.all(
      assignments.map(async (assignment) => {
        const staff = await ctx.db.get(assignment.staffId);
        const subject = await ctx.db.get(assignment.subjectId);
        return {
          ...assignment,
          staffName: staff?.name || "Unknown",
          subjectName: subject?.name || "Unknown",
          subjectCode: subject?.code || "Unknown",
        };
      })
    );

    return enrichedAssignments;
  },
});

export const checkConflict = query({
  args: {
    staffId: v.id("staff"),
    day: v.string(),
    period: v.number(),
    excludeId: v.optional(v.id("timetableAssignments")),
  },
  handler: async (ctx, args) => {
    const existingAssignment = await ctx.db
      .query("timetableAssignments")
      .withIndex("by_staff_day_period", (q) =>
        q.eq("staffId", args.staffId).eq("day", args.day).eq("period", args.period)
      )
      .first();

    if (!existingAssignment) {
      return { hasConflict: false };
    }

    if (args.excludeId && existingAssignment._id === args.excludeId) {
      return { hasConflict: false };
    }

    const subject = await ctx.db.get(existingAssignment.subjectId);
    return {
      hasConflict: true,
      conflictWith: {
        subject: subject?.name || "Unknown",
        classroom: existingAssignment.classroom,
      },
    };
  },
});

export const checkStaffDailyLimit = query({
  args: {
    staffId: v.id("staff"),
    day: v.string(),
    excludeId: v.optional(v.id("timetableAssignments")),
  },
  handler: async (ctx, args) => {
    const staff = await ctx.db.get(args.staffId);
    if (!staff) {
      throw new Error("Staff not found");
    }

    const assignments = await ctx.db
      .query("timetableAssignments")
      .withIndex("by_staff", (q) => q.eq("staffId", args.staffId))
      .filter((q) => q.eq(q.field("day"), args.day))
      .collect();

    const filteredAssignments = args.excludeId
      ? assignments.filter((a) => a._id !== args.excludeId)
      : assignments;

    return {
      currentCount: filteredAssignments.length,
      maxAllowed: staff.maxPeriodsPerDay,
      canAdd: filteredAssignments.length < staff.maxPeriodsPerDay,
    };
  },
});

export const create = mutation({
  args: {
    staffId: v.id("staff"),
    subjectId: v.id("subjects"),
    day: v.string(),
    period: v.number(),
    classroom: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated");
    }

    // Check for conflicts
    const conflict = await ctx.db
      .query("timetableAssignments")
      .withIndex("by_staff_day_period", (q) =>
        q.eq("staffId", args.staffId).eq("day", args.day).eq("period", args.period)
      )
      .first();

    if (conflict) {
      throw new Error("Staff already has an assignment at this time slot");
    }

    // Check daily limit
    const staff = await ctx.db.get(args.staffId);
    if (!staff) {
      throw new Error("Staff not found");
    }

    const dailyAssignments = await ctx.db
      .query("timetableAssignments")
      .withIndex("by_staff", (q) => q.eq("staffId", args.staffId))
      .filter((q) => q.eq(q.field("day"), args.day))
      .collect();

    if (dailyAssignments.length >= staff.maxPeriodsPerDay) {
      throw new Error(`Staff has reached maximum periods per day (${staff.maxPeriodsPerDay})`);
    }

    return await ctx.db.insert("timetableAssignments", {
      ...args,
      createdBy: userId,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("timetableAssignments") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated");
    }

    await ctx.db.delete(args.id);
  },
});

export const getWeeklySchedule = query({
  args: {},
  handler: async (ctx) => {
    const assignments = await ctx.db.query("timetableAssignments").collect();
    
    const schedule: Record<string, Record<number, any[]>> = {};
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const periods = [1, 2, 3, 4, 5, 6, 7, 8];

    // Initialize schedule structure
    days.forEach(day => {
      schedule[day] = {};
      periods.forEach(period => {
        schedule[day][period] = [];
      });
    });

    // Populate schedule with assignments
    for (const assignment of assignments) {
      const staff = await ctx.db.get(assignment.staffId);
      const subject = await ctx.db.get(assignment.subjectId);
      
      if (schedule[assignment.day] && schedule[assignment.day][assignment.period]) {
        schedule[assignment.day][assignment.period].push({
          ...assignment,
          staffName: staff?.name || "Unknown",
          subjectName: subject?.name || "Unknown",
          subjectCode: subject?.code || "Unknown",
        });
      }
    }

    return schedule;
  },
});
