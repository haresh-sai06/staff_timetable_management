"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function AssignmentForm() {
  const [staffId, setStaffId] = useState<Id<"staff"> | "">("");
  const [subjectId, setSubjectId] = useState<Id<"subjects"> | "">("");
  const [day, setDay] = useState("");
  const [period, setPeriod] = useState<number | "">("");
  const [classroom, setClassroom] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const staff = useQuery(api.staff.list);
  const subjects = useQuery(api.subjects.list);
  const createAssignment = useMutation(api.timetable.create);

  const conflict = useQuery(
    api.timetable.checkConflict,
    staffId && day && period
      ? { staffId: staffId as Id<"staff">, day, period: period as number }
      : "skip"
  );

  const dailyLimit = useQuery(
    api.timetable.checkStaffDailyLimit,
    staffId && day ? { staffId: staffId as Id<"staff">, day } : "skip"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!staffId || !subjectId || !day || !period) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (conflict?.hasConflict) {
      toast.error(`Conflict detected: Staff already teaching ${conflict.conflictWith?.subject} at this time`);
      return;
    }

    if (dailyLimit && !dailyLimit.canAdd) {
      toast.error(`Staff has reached maximum periods per day (${dailyLimit.maxAllowed})`);
      return;
    }

    setIsSubmitting(true);
    try {
      await createAssignment({
        staffId: staffId as Id<"staff">,
        subjectId: subjectId as Id<"subjects">,
        day,
        period: period as number,
        classroom: classroom || undefined,
      });

      setStaffId("");
      setSubjectId("");
      setDay("");
      setPeriod("");
      setClassroom("");
      
      toast.success("Assignment created successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create assignment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasConflict = conflict?.hasConflict;
  const exceedsLimit = dailyLimit && !dailyLimit.canAdd;
  const canSubmit = staffId && subjectId && day && period && !hasConflict && !exceedsLimit;

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg border">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Assignment</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Staff Member *
          </label>
          <select
            value={staffId}
            onChange={(e) => setStaffId(e.target.value as Id<"staff"> | "")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Staff</option>
            {staff?.map((member) => (
              <option key={member._id} value={member._id}>
                {member.name} ({member.department})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject *
          </label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value as Id<"subjects"> | "")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Subject</option>
            {subjects?.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.name} ({subject.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Day *
          </label>
          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Day</option>
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Period *
          </label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value ? Number(e.target.value) : "")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Period</option>
            {PERIODS.map((p) => (
              <option key={p} value={p}>
                Period {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Classroom
          </label>
          <input
            type="text"
            value={classroom}
            onChange={(e) => setClassroom(e.target.value)}
            placeholder="e.g., Room 101"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {staffId && day && dailyLimit && (
        <div className="mt-3 text-sm">
          <span className={`${dailyLimit.canAdd ? "text-green-600" : "text-red-600"}`}>
            Daily periods: {dailyLimit.currentCount}/{dailyLimit.maxAllowed}
          </span>
        </div>
      )}

      {hasConflict && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">
            ⚠️ Conflict detected: Staff already teaching {conflict.conflictWith?.subject} at this time
            {conflict.conflictWith?.classroom && ` in ${conflict.conflictWith.classroom}`}
          </p>
        </div>
      )}

      {exceedsLimit && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-600">
            ⚠️ Staff has reached maximum periods per day ({dailyLimit?.maxAllowed})
          </p>
        </div>
      )}

      <div className="mt-4">
        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className={`px-4 py-2 rounded-md font-medium ${
            canSubmit && !isSubmitting
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isSubmitting ? "Creating..." : "Create Assignment"}
        </button>
      </div>
    </form>
  );
}
