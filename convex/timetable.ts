import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

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
    let query = ctx.db.query("timetableAssignments");
    
    if (args.department && args.semester) {
      query = query.withIndex("by_department_semester", (q: any) => 
        q.eq("department", args.department).eq("semester", args.semester)
      );
    } else if (args.department) {
      query = query.filter((q: any) => q.eq(q.field("department"), args.department));
    }
    
    const assignments = await query.collect();
    
    const enrichedAssignments = await Promise.all(
      assignments.map(async (assignment) => {
        const staff = await ctx.db.get(assignment.staffId);
        const subject = await ctx.db.get(assignment.subjectId);
        const classroom = await ctx.db.get(assignment.classroomId);
        
        return {
          ...assignment,
          staffName: staff?.name || "Unknown",
          subjectName: subject?.name || "Unknown",
          subjectCode: subject?.code || "Unknown",
          subjectType: subject?.type || "theory",
          classroomName: classroom?.name || "Unknown",
          classroomType: classroom?.type || "lecture_hall",
        };
      })
    );

    return enrichedAssignments;
  },
});

export const checkConflicts = mutation({
  args: {
    department: v.string(),
    semester: v.union(v.literal("odd"), v.literal("even")),
    staffId: v.id("staff"),
    subjectId: v.id("subjects"),
    classroomId: v.id("classrooms"),
    day: v.string(),
    timeSlot: v.string(),
    excludeId: v.optional(v.id("timetableAssignments")),
  },
  handler: async (ctx, args) => {
    const conflicts = [];

    // Check staff conflict
    const staffConflict = await ctx.db
      .query("timetableAssignments")
      .withIndex("by_staff_day_time", (q: any) =>
        q.eq("staffId", args.staffId).eq("day", args.day).eq("timeSlot", args.timeSlot)
      )
      .first();

    if (staffConflict && (!args.excludeId || staffConflict._id !== args.excludeId)) {
      const subject = await ctx.db.get(staffConflict.subjectId);
      const classroom = await ctx.db.get(staffConflict.classroomId);
      conflicts.push({
        type: "staff",
        message: `Staff already teaching ${subject?.name || "Unknown"} in ${classroom?.name || "Unknown"}`,
      });
    }

    // Check classroom conflict
    const classroomConflict = await ctx.db
      .query("timetableAssignments")
      .withIndex("by_classroom_day_time", (q: any) =>
        q.eq("classroomId", args.classroomId).eq("day", args.day).eq("timeSlot", args.timeSlot)
      )
      .first();

    if (classroomConflict && (!args.excludeId || classroomConflict._id !== args.excludeId)) {
      const subject = await ctx.db.get(classroomConflict.subjectId);
      const staff = await ctx.db.get(classroomConflict.staffId);
      conflicts.push({
        type: "classroom",
        message: `Classroom already occupied by ${staff?.name || "Unknown"} for ${subject?.name || "Unknown"}`,
      });
    }

    // Check staff workload
    const staff = await ctx.db.get(args.staffId);
    if (staff) {
      const staffAssignments = await ctx.db
        .query("timetableAssignments")
        .withIndex("by_staff", (q: any) => q.eq("staffId", args.staffId))
        .filter((q: any) => 
          q.and(
            q.eq(q.field("department"), args.department),
            q.eq(q.field("semester"), args.semester)
          )
        )
        .collect();

      const filteredAssignments = args.excludeId
        ? staffAssignments.filter((a) => a._id !== args.excludeId)
        : staffAssignments;

      if (filteredAssignments.length >= staff.maxHours) {
        conflicts.push({
          type: "workload",
          message: `Staff has reached maximum hours per week (${staff.maxHours})`,
        });
      }
    }

    return {
      hasConflicts: conflicts.length > 0,
      conflicts,
    };
  },
});

export const create = mutation({
  args: {
    department: v.string(),
    semester: v.union(v.literal("odd"), v.literal("even")),
    staffId: v.id("staff"),
    subjectId: v.id("subjects"),
    classroomId: v.id("classrooms"),
    day: v.string(),
    timeSlot: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx);

    // Check for conflicts
    const conflictCheck = await ctx.runMutation(internal.timetable.checkConflicts, args);
    
    if (conflictCheck.hasConflicts) {
      throw new Error(`Conflicts detected: ${conflictCheck.conflicts.map(c => c.message).join(", ")}`);
    }

    return await ctx.db.insert("timetableAssignments", {
      ...args,
      createdBy: user._id,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("timetableAssignments") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});

export const getWeeklySchedule = query({
  args: {
    department: v.string(),
    semester: v.union(v.literal("odd"), v.literal("even")),
  },
  handler: async (ctx, args) => {
    const assignments = await ctx.db
      .query("timetableAssignments")
      .withIndex("by_department_semester", (q: any) => 
        q.eq("department", args.department).eq("semester", args.semester)
      )
      .collect();
    
    const schedule: Record<string, Record<string, any[]>> = {};
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const timeSlots = [
      "08:00-09:00", "09:00-10:00", "10:00-11:00", "11:00-12:00",
      "12:00-13:00", "13:00-14:00", "14:00-15:00", "15:00-16:00", "16:00-17:00"
    ];

    days.forEach(day => {
      schedule[day] = {};
      timeSlots.forEach(slot => {
        schedule[day][slot] = [];
      });
    });

    for (const assignment of assignments) {
      const staff = await ctx.db.get(assignment.staffId);
      const subject = await ctx.db.get(assignment.subjectId);
      const classroom = await ctx.db.get(assignment.classroomId);
      
      if (schedule[assignment.day] && schedule[assignment.day][assignment.timeSlot]) {
        schedule[assignment.day][assignment.timeSlot].push({
          ...assignment,
          staffName: staff?.name || "Unknown",
          subjectName: subject?.name || "Unknown",
          subjectCode: subject?.code || "Unknown",
          subjectType: subject?.type || "theory",
          classroomName: classroom?.name || "Unknown",
          classroomType: classroom?.type || "lecture_hall",
        });
      }
    }

    return schedule;
  },
});

export const getStaffSchedule = query({
  args: {
    staffId: v.id("staff"),
    department: v.optional(v.string()),
    semester: v.optional(v.union(v.literal("odd"), v.literal("even"))),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("timetableAssignments")
      .withIndex("by_staff", (q: any) => q.eq("staffId", args.staffId));

    if (args.department && args.semester) {
      query = query.filter((q: any) => 
        q.and(
          q.eq(q.field("department"), args.department),
          q.eq(q.field("semester"), args.semester)
        )
      );
    }

    const assignments = await query.collect();
    
    const enrichedAssignments = await Promise.all(
      assignments.map(async (assignment) => {
        const subject = await ctx.db.get(assignment.subjectId);
        const classroom = await ctx.db.get(assignment.classroomId);
        
        return {
          ...assignment,
          subjectName: subject?.name || "Unknown",
          subjectCode: subject?.code || "Unknown",
          subjectType: subject?.type || "theory",
          classroomName: classroom?.name || "Unknown",
          classroomType: classroom?.type || "lecture_hall",
        };
      })
    );

    return enrichedAssignments;
  },
});