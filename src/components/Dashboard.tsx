"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import TimetableManager from "./TimetableManager";
import ReportForm from "./ReportForm";
import AdminReportManager from "./AdminReportManager";
import SplineViewer from "./SplineViewer";

interface User {
  _id: string;
  email: string;
  role?: "user" | "admin";
  name?: string;
}

interface DashboardProps {
  user: User;
}

type TabType = "schedule" | "assignments" | "staff" | "subjects" | "reports";

export default function Dashboard({ user }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("schedule");
  const ensureUser = useMutation(api.users.ensureUser);
  const isAdmin = user.role === "admin";

  useEffect(() => {
    if (!user.role) {
      ensureUser();
    }
  }, [user.role, ensureUser]);

  const userTabs = [
    { id: "schedule" as TabType, label: "Weekly Schedule", icon: "📅" },
    { id: "assignments" as TabType, label: "Assignments", icon: "📋" },
    { id: "staff" as TabType, label: "Staff", icon: "👥" },
    { id: "subjects" as TabType, label: "Subjects", icon: "📚" },
    { id: "reports" as TabType, label: "Reports", icon: "📝" },
  ];

  const adminTabs = [
    { id: "schedule" as TabType, label: "Weekly Schedule", icon: "📅" },
    { id: "assignments" as TabType, label: "Assignments", icon: "📋" },
    { id: "staff" as TabType, label: "Staff Management", icon: "👥" },
    { id: "subjects" as TabType, label: "Subject Management", icon: "📚" },
    { id: "reports" as TabType, label: "Report Management", icon: "📝" },
  ];

  const tabs = isAdmin ? adminTabs : userTabs;

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Welcome Section with Spline */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome, {user.name || user.email}!
            </h1>
            <p className="text-gray-600 mb-4">
              {isAdmin 
                ? "You have full administrative access to manage the timetable system."
                : "You can view timetables and submit reports to administrators."
              }
            </p>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                isAdmin 
                  ? "bg-red-100 text-red-800" 
                  : "bg-blue-100 text-blue-800"
              }`}>
                {isAdmin ? "Administrator" : "User"}
              </span>
            </div>
          </div>
          <div className="h-64 lg:h-80">
            <SplineViewer />
          </div>
        </div>
      </div>

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
        {(activeTab === "schedule" || activeTab === "assignments" || activeTab === "staff" || activeTab === "subjects") && (
          <TimetableManager activeTab={activeTab} isAdmin={isAdmin} />
        )}

        {activeTab === "reports" && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {isAdmin ? "Report Management" : "Submit Report"}
            </h2>
            {isAdmin ? <AdminReportManager /> : <ReportForm />}
          </div>
        )}
      </div>
    </div>
  );
}
