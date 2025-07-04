import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import AssignmentForm from "./AssignmentForm";
import WeeklyScheduleGrid from "./WeeklyScheduleGrid";
import AssignmentsList from "./AssignmentsList";
import StaffManagement from "./StaffManagement";
import SubjectManagement from "./SubjectManagement";

type TabType = "schedule" | "assignments" | "staff" | "subjects";

export default function TimetableManager() {
  const [activeTab, setActiveTab] = useState<TabType>("schedule");

  const tabs = [
    { id: "schedule" as TabType, label: "Weekly Schedule", icon: "📅" },
    { id: "assignments" as TabType, label: "Assignments", icon: "📋" },
    { id: "staff" as TabType, label: "Staff", icon: "👥" },
    { id: "subjects" as TabType, label: "Subjects", icon: "📚" },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border">
        {activeTab === "schedule" && (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Weekly Schedule</h2>
              <AssignmentForm />
            </div>
            <WeeklyScheduleGrid />
          </div>
        )}

        {activeTab === "assignments" && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">All Assignments</h2>
            <AssignmentsList />
          </div>
        )}

        {activeTab === "staff" && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Staff Management</h2>
            <StaffManagement />
          </div>
        )}

        {activeTab === "subjects" && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Subject Management</h2>
            <SubjectManagement />
          </div>
        )}
      </div>
    </div>
  );
}
