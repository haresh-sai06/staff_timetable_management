"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import TimetableManager from "./TimetableManager";
import ReportForm from "./ReportForm";
import AdminReportManager from "./AdminReportManager";
import SplineViewer from "./SplineViewer";
import DepartmentManagement from "./DepartmentManagement";
import ClassroomManagement from "./ClassroomManagement";

interface User {
  _id: string;
  email: string;
  role?: "user" | "admin";
  name?: string;
}

interface DashboardProps {
  user: User;
}

type TabType = "schedule" | "assignments" | "staff" | "subjects" | "departments" | "classrooms" | "reports";

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
    { id: "departments" as TabType, label: "Departments", icon: "🏢" },
    { id: "classrooms" as TabType, label: "Classrooms", icon: "🏛️" },
    { id: "reports" as TabType, label: "Report Management", icon: "📝" },
  ];

  const tabs = isAdmin ? adminTabs : userTabs;

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="relative max-w-7xl mx-auto p-4 space-y-6">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 opacity-80 z-0"></div>

      {/* Welcome Section with Spline */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-sm border border-gray-700 p-6 z-10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-3xl font-bold text-gray-100 mb-2">
              Welcome, {user.name || user.email}!
            </h1>
            <p className="text-gray-300 mb-4">
              {isAdmin 
                ? "Advanced College Timetable Management System - Full administrative access for Anna University-affiliated institutions."
                : "View department-wise timetables, staff schedules, and submit reports to administrators."
              }
            </p>
            <div className="flex items-center space-x-4">
              <motion.span 
                whileHover={{ scale: 1.05 }}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isAdmin 
                    ? "bg-red-900 text-red-200" 
                    : "bg-blue-900 text-blue-200"
                }`}
              >
                {isAdmin ? "Administrator" : "User"}
              </motion.span>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="h-64 lg:h-80"
          >
            <SplineViewer />
          </motion.div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative border-b border-gray-700 z-10"
      >
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab, index) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.id
                  ? "border-blue-400 text-blue-300"
                  : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </motion.button>
          ))}
        </nav>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={tabVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3 }}
          className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-sm border border-gray-700 z-10"
        >
          {(activeTab === "schedule" || activeTab === "assignments" || activeTab === "staff" || activeTab === "subjects") && (
            <TimetableManager activeTab={activeTab} isAdmin={isAdmin} />
          )}

          {activeTab === "departments" && isAdmin && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-100 mb-4">Department Management</h2>
              <DepartmentManagement />
            </div>
          )}

          {activeTab === "classrooms" && isAdmin && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-100 mb-4">Classroom Management</h2>
              <ClassroomManagement />
            </div>
          )}

          {activeTab === "reports" && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-100 mb-4">
                {isAdmin ? "Report Management" : "Submit Report"}
              </h2>
              {isAdmin ? <AdminReportManager /> : <ReportForm />}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}