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
    <div className="relative max-w-7xl mx-auto p-4 space-y-6">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 opacity-80 z-0"></div>

      {/* Welcome Section with Spline */}
      <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-sm border border-gray-700 p-6 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-100 mb-2">
              Welcome, {user.name || user.email}!
            </h1>
            <p className="text-gray-300 mb-4">
              {isAdmin 
                ? "You have full administrative access to manage the timetable system."
                : "You can view timetables and submit reports to administrators."
              }
            </p>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                isAdmin 
                  ? "bg-red-900 text-red-200" 
                  : "bg-blue-900 text-blue-200"
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
      <div className="relative border-b border-gray-700 z-10">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-blue-400 text-blue-300"
                  : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-sm border border-gray-700 z-10">
        {(activeTab === "schedule" || activeTab === "assignments" || activeTab === "staff" || activeTab === "subjects") && (
          <TimetableManager activeTab={activeTab} isAdmin={isAdmin} />
        )}

        {activeTab === "reports" && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">
              {isAdmin ? "Report Management" : "Submit Report"}
            </h2>
            {isAdmin ? <AdminReportManager /> : <ReportForm />}
          </div>
        )}
      </div>
    </div>
  );
}