import { Id } from "../../convex/_generated/dataModel";

export interface Assignment {
  _id: string;
  staffId: Id<"staff">;
  subjectId: Id<"subjects">;
  day: string;
  period: number;
  classroom?: string;
  staffName: string;
  subjectName: string;
  subjectCode: string;
}

export interface ConflictResult {
  hasConflict: boolean;
  conflictWith?: {
    subject: string;
    classroom?: string;
  };
}

export interface DailyLimitResult {
  currentCount: number;
  maxAllowed: number;
  canAdd: boolean;
}

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;
export const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export type Day = typeof DAYS[number];
export type Period = typeof PERIODS[number];

/**
 * Client-side conflict detection utility
 */
export function detectConflicts(
  assignments: Assignment[],
  newAssignment: Omit<Assignment, "_id" | "staffName" | "subjectName" | "subjectCode">,
  excludeId?: string
): ConflictResult {
  const conflict = assignments.find(
    (assignment) =>
      assignment._id !== excludeId &&
      assignment.staffId === newAssignment.staffId &&
      assignment.day === newAssignment.day &&
      assignment.period === newAssignment.period
  );

  if (conflict) {
    return {
      hasConflict: true,
      conflictWith: {
        subject: conflict.subjectName,
        classroom: conflict.classroom,
      },
    };
  }

  return { hasConflict: false };
}

/**
 * Check if staff member has reached daily period limit
 */
export function checkDailyLimit(
  assignments: Assignment[],
  staffId: Id<"staff">,
  day: string,
  maxPeriodsPerDay: number,
  excludeId?: string
): DailyLimitResult {
  const dailyAssignments = assignments.filter(
    (assignment) =>
      assignment._id !== excludeId &&
      assignment.staffId === staffId &&
      assignment.day === day
  );

  return {
    currentCount: dailyAssignments.length,
    maxAllowed: maxPeriodsPerDay,
    canAdd: dailyAssignments.length < maxPeriodsPerDay,
  };
}

/**
 * Generate a weekly schedule grid from assignments
 */
export function generateScheduleGrid(assignments: Assignment[]) {
  const schedule: Record<Day, Record<Period, Assignment[]>> = {} as any;

  // Initialize empty schedule
  DAYS.forEach((day) => {
    schedule[day] = {} as Record<Period, Assignment[]>;
    PERIODS.forEach((period) => {
      schedule[day][period] = [];
    });
  });

  // Populate schedule with assignments
  assignments.forEach((assignment) => {
    const day = assignment.day as Day;
    const period = assignment.period as Period;
    
    if (schedule[day] && schedule[day][period]) {
      schedule[day][period].push(assignment);
    }
  });

  return schedule;
}

/**
 * Get staff workload statistics
 */
export function getStaffWorkload(assignments: Assignment[], staffId: Id<"staff">) {
  const staffAssignments = assignments.filter((a) => a.staffId === staffId);
  
  const dailyCount: Record<string, number> = {};
  DAYS.forEach((day) => {
    dailyCount[day] = staffAssignments.filter((a) => a.day === day).length;
  });

  return {
    totalAssignments: staffAssignments.length,
    dailyCount,
    averagePerDay: staffAssignments.length / 5,
  };
}

/**
 * Validate assignment constraints
 */
export function validateAssignment(
  assignments: Assignment[],
  newAssignment: Omit<Assignment, "_id" | "staffName" | "subjectName" | "subjectCode">,
  maxPeriodsPerDay: number,
  excludeId?: string
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for conflicts
  const conflict = detectConflicts(assignments, newAssignment, excludeId);
  if (conflict.hasConflict) {
    errors.push(
      `Staff already teaching ${conflict.conflictWith?.subject} at this time${
        conflict.conflictWith?.classroom ? ` in ${conflict.conflictWith.classroom}` : ""
      }`
    );
  }

  // Check daily limit
  const dailyLimit = checkDailyLimit(
    assignments,
    newAssignment.staffId,
    newAssignment.day,
    maxPeriodsPerDay,
    excludeId
  );
  if (!dailyLimit.canAdd) {
    errors.push(`Staff has reached maximum periods per day (${maxPeriodsPerDay})`);
  }

  // Validate day and period
  if (!DAYS.includes(newAssignment.day as Day)) {
    errors.push("Invalid day selected");
  }
  if (!PERIODS.includes(newAssignment.period as Period)) {
    errors.push("Invalid period selected");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Auto-scheduling utility (basic greedy algorithm)
 */
export function autoSchedule(
  staff: Array<{ _id: Id<"staff">; maxPeriodsPerDay: number }>,
  subjects: Array<{ _id: Id<"subjects"> }>,
  existingAssignments: Assignment[] = []
): Array<Omit<Assignment, "_id" | "staffName" | "subjectName" | "subjectCode">> {
  const newAssignments: Array<Omit<Assignment, "_id" | "staffName" | "subjectName" | "subjectCode">> = [];
  const allAssignments = [...existingAssignments];

  // Simple greedy approach: try to assign each subject to available staff
  for (const subject of subjects) {
    for (const day of DAYS) {
      for (const period of PERIODS) {
        // Find available staff for this time slot
        const availableStaff = staff.filter((member) => {
          const conflict = detectConflicts(
            allAssignments,
            {
              staffId: member._id,
              subjectId: subject._id,
              day,
              period,
            }
          );

          const dailyLimit = checkDailyLimit(
            allAssignments,
            member._id,
            day,
            member.maxPeriodsPerDay
          );

          return !conflict.hasConflict && dailyLimit.canAdd;
        });

        if (availableStaff.length > 0) {
          // Assign to the first available staff member
          const assignment = {
            staffId: availableStaff[0]._id,
            subjectId: subject._id,
            day,
            period,
          };

          newAssignments.push(assignment);
          allAssignments.push({
            ...assignment,
            _id: `temp-${Date.now()}-${Math.random()}`,
            staffName: "Auto",
            subjectName: "Auto",
            subjectCode: "AUTO",
          });

          break; // Move to next day
        }
      }
    }
  }

  return newAssignments;
}
