import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  users: defineTable({
    email: v.string(),
    role: v.optional(v.union(v.literal("user"), v.literal("admin"))),
    name: v.optional(v.string()),
  }).index("by_email", ["email"]),

  departments: defineTable({
    name: v.string(),
    code: v.string(),
    isActive: v.boolean(),
  }).index("by_code", ["code"]),

  staff: defineTable({
    name: v.string(),
    email: v.string(),
    department: v.string(),
    institutionRole: v.union(v.literal("Assistant Professor"), v.literal("Professor")),
    maxHours: v.number(), // 18 for Assistant Professor, 12 for Professor
    isActive: v.boolean(),
  }).index("by_email", ["email"])
    .index("by_department", ["department"]),

  classrooms: defineTable({
    name: v.string(),
    capacity: v.number(),
    type: v.union(v.literal("lecture_hall"), v.literal("lab"), v.literal("seminar_room")),
    department: v.optional(v.string()),
    isActive: v.boolean(),
  }).index("by_type", ["type"])
    .index("by_department", ["department"]),

  subjects: defineTable({
    name: v.string(),
    code: v.string(),
    credits: v.number(),
    semester: v.union(v.literal("odd"), v.literal("even")),
    department: v.string(),
    type: v.union(v.literal("theory"), v.literal("lab")),
    isActive: v.boolean(),
  }).index("by_code", ["code"])
    .index("by_department_semester", ["department", "semester"]),

  timetableAssignments: defineTable({
    department: v.string(),
    semester: v.union(v.literal("odd"), v.literal("even")),
    staffId: v.id("staff"),
    subjectId: v.id("subjects"),
    classroomId: v.id("classrooms"),
    day: v.string(),
    timeSlot: v.string(), // e.g., "09:00-10:00"
    createdBy: v.id("users"),
  })
    .index("by_department_semester", ["department", "semester"])
    .index("by_staff_day_time", ["staffId", "day", "timeSlot"])
    .index("by_classroom_day_time", ["classroomId", "day", "timeSlot"])
    .index("by_staff", ["staffId"]),

  reports: defineTable({
    userId: v.id("users"),
    issueType: v.string(),
    description: v.string(),
    reason: v.string(),
    status: v.union(v.literal("pending"), v.literal("resolved")),
    createdAt: v.number(),
    resolvedAt: v.optional(v.number()),
    resolvedBy: v.optional(v.id("users")),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});