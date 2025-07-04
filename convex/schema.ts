import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  users: defineTable({
    email: v.string(),
    role: v.optional(v.union(v.literal("user"), v.literal("admin"))),
    name: v.optional(v.string()),
  }).index("by_email", ["email"]),

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
    day: v.string(),
    period: v.number(),
    classroom: v.optional(v.string()),
    createdBy: v.id("users"),
  })
    .index("by_staff_day_period", ["staffId", "day", "period"])
    .index("by_day_period", ["day", "period"])
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
