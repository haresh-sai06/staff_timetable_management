import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  staff: defineTable({
    name: v.string(),
    email: v.string(),
    department: v.string(),
    maxPeriodsPerDay: v.number(),
    isActive: v.boolean(),
  }).index("by_email", ["email"]),

  subjects: defineTable({
    name: v.string(),
    code: v.string(),
    department: v.string(),
    isActive: v.boolean(),
  }).index("by_code", ["code"]),

  timetableAssignments: defineTable({
    staffId: v.id("staff"),
    subjectId: v.id("subjects"),
    day: v.string(), // "Monday", "Tuesday", etc.
    period: v.number(), // 1, 2, 3, etc.
    classroom: v.optional(v.string()),
    createdBy: v.id("users"),
  })
    .index("by_staff_day_period", ["staffId", "day", "period"])
    .index("by_day_period", ["day", "period"])
    .index("by_staff", ["staffId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
