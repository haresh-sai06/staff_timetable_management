"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

interface WeeklyScheduleGridProps {
  isAdmin: boolean;
}

export default function WeeklyScheduleGrid({ isAdmin }: WeeklyScheduleGridProps) {
  const schedule = useQuery(api.timetable.getWeeklySchedule);
  const removeAssignment = useMutation(api.timetable.remove);

  const handleRemoveAssignment = async (assignmentId: string) => {
    if (!isAdmin) return;
    
    if (!confirm("Are you sure you want to remove this assignment?")) {
      return;
    }

    try {
      await removeAssignment({ id: assignmentId as any });
      toast.success("Assignment removed successfully");
    } catch (error) {
      toast.error("Failed to remove assignment");
    }
  };

  if (!schedule) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-full">
        <div className="grid grid-cols-6 gap-1 mb-2">
          <div className="p-2 font-semibold text-center bg-gray-800 text-gray-100 rounded">
            Period
          </div>
          {DAYS.map((day) => (
            <div key={day} className="p-2 font-semibold text-center bg-gray-800 text-gray-100 rounded">
              {day}
            </div>
          ))}
        </div>

        {PERIODS.map((period) => (
          <div key={period} className="grid grid-cols-6 gap-1 mb-1">
            <div className="p-2 text-center bg-gray-700 text-gray-100 rounded font-medium">
              {period}
            </div>
            
            {DAYS.map((day) => (
              <div key={`${day}-${period}`} className="min-h-[80px] p-1 bg-gray-900 border border-gray-700 rounded">
                {schedule[day]?.[period]?.map((assignment: any) => (
                  <div
                    key={assignment._id}
                    className="mb-1 p-2 bg-blue-900 border border-blue-700 rounded text-xs group relative"
                  >
                    <div className="font-medium text-blue-200">
                      {assignment.subjectCode}
                    </div>
                    <div className="text-blue-300 truncate">
                      {assignment.staffName}
                    </div>
                    {assignment.classroom && (
                      <div className="text-blue-400 text-xs">
                        {assignment.classroom}
                      </div>
                    )}
                    
                    {isAdmin && (
                      <button
                        onClick={() => handleRemoveAssignment(assignment._id)}
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-700"
                        title="Remove assignment"
                      >
                        ×
                      </button>
                    )}
                    
                    <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-gray-100 text-xs rounded py-1 px-2 -top-8 left-0 whitespace-nowrap">
                      {assignment.subjectName} - {assignment.staffName}
                      {assignment.classroom && ` (${assignment.classroom})`}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-gray-800 rounded border border-gray-700">
        <h4 className="font-medium text-gray-100 mb-2">Legend</h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>• Hover over assignments to see full details</div>
          {isAdmin && <div>• Click × to remove an assignment</div>}
          <div>• Empty cells indicate available time slots</div>
        </div>
      </div>
    </div>
  );
}