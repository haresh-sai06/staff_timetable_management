"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface AssignmentsListProps {
  isAdmin: boolean;
}

export default function AssignmentsList({ isAdmin }: AssignmentsListProps) {
  const assignments = useQuery(api.timetable.list);
  const removeAssignment = useMutation(api.timetable.remove);

  const handleRemove = async (id: string) => {
    if (!isAdmin) return;
    
    if (!confirm("Are you sure you want to remove this assignment?")) {
      return;
    }

    try {
      await removeAssignment({ id: id as any });
      toast.success("Assignment removed successfully");
    } catch (error) {
      toast.error("Failed to remove assignment");
    }
  };

  if (!assignments) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No assignments created yet.</p>
        {isAdmin && <p className="text-sm mt-1">Use the form above to create your first assignment.</p>}
      </div>
    );
  }

  const groupedAssignments = assignments.reduce((acc, assignment) => {
    if (!acc[assignment.day]) {
      acc[assignment.day] = [];
    }
    acc[assignment.day].push(assignment);
    return acc;
  }, {} as Record<string, typeof assignments>);

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  return (
    <div className="space-y-6">
      {DAYS.map((day) => {
        const dayAssignments = groupedAssignments[day] || [];
        if (dayAssignments.length === 0) return null;

        const sortedAssignments = dayAssignments.sort((a, b) => a.period - b.period);

        return (
          <div key={day} className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {day} ({sortedAssignments.length} assignments)
            </h3>
            
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {sortedAssignments.map((assignment) => (
                <div
                  key={assignment._id}
                  className="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        Period {assignment.period}
                      </div>
                      <div className="text-sm text-gray-600">
                        {assignment.subjectName} ({assignment.subjectCode})
                      </div>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => handleRemove(assignment._id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                        title="Remove assignment"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center text-gray-600">
                      <span className="w-16">Staff:</span>
                      <span className="font-medium">{assignment.staffName}</span>
                    </div>
                    {assignment.classroom && (
                      <div className="flex items-center text-gray-600">
                        <span className="w-16">Room:</span>
                        <span>{assignment.classroom}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {Object.keys(groupedAssignments).length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No assignments found.</p>
        </div>
      )}
    </div>
  );
}
