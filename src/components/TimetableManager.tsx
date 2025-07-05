"use client";

import AssignmentForm from "./AssignmentForm";
import WeeklyScheduleGrid from "./WeeklyScheduleGrid";
import AssignmentsList from "./AssignmentsList";
import StaffManagement from "./StaffManagement";
import SubjectManagement from "./SubjectManagement";

interface TimetableManagerProps {
  activeTab: "schedule" | "assignments" | "staff" | "subjects";
  isAdmin: boolean;
}

export default function TimetableManager({ activeTab, isAdmin }: TimetableManagerProps) {
  return (
    <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700">
      {activeTab === "schedule" && (
        <div>
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Weekly Schedule</h2>
          {isAdmin && (
            <div className="mb-6">
              <AssignmentForm />
            </div>
          )}
          <WeeklyScheduleGrid isAdmin={isAdmin} />
        </div>
      )}

      {activeTab === "assignments" && (
        <div>
          <h2 className="text-xl font-semibold text-gray-100 mb-4">All Assignments</h2>
          <AssignmentsList isAdmin={isAdmin} />
        </div>
      )}

      {activeTab === "staff" && (
        <div>
          <h2 className="text-xl font-semibold text-gray-100 mb-4">
            {isAdmin ? "Staff Management" : "Staff Directory"}
          </h2>
          <StaffManagement isAdmin={isAdmin} />
        </div>
      )}

      {activeTab === "subjects" && (
        <div>
          <h2 className="text-xl font-semibold text-gray-100 mb-4">
            {isAdmin ? "Subject Management" : "Subject Directory"}
          </h2>
          <SubjectManagement isAdmin={isAdmin} />
        </div>
      )}
    </div>
  );
}