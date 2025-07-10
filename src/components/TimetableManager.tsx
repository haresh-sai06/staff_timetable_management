"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AssignmentForm from "./AssignmentForm";
import WeeklyScheduleGrid from "./WeeklyScheduleGrid";
import AssignmentsList from "./AssignmentsList";
import StaffManagement from "./StaffManagement";
import SubjectManagement from "./SubjectManagement";
import DepartmentSelector from "./DepartmentSelector";

interface TimetableManagerProps {
  activeTab: "schedule" | "assignments" | "staff" | "subjects";
  isAdmin: boolean;
}

export default function TimetableManager({ activeTab, isAdmin }: TimetableManagerProps) {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<"odd" | "even">("odd");

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700"
    >
      <AnimatePresence mode="wait">
        {activeTab === "schedule" && (
          <motion.div
            key="schedule"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
              <h2 className="text-xl font-semibold text-gray-100">Weekly Schedule</h2>
              <DepartmentSelector
                selectedDepartment={selectedDepartment}
                selectedSemester={selectedSemester}
                onDepartmentChange={setSelectedDepartment}
                onSemesterChange={setSelectedSemester}
              />
            </div>
            
            {isAdmin && selectedDepartment && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-6"
              >
                <AssignmentForm 
                  selectedDepartment={selectedDepartment}
                  selectedSemester={selectedSemester}
                />
              </motion.div>
            )}
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <WeeklyScheduleGrid 
                isAdmin={isAdmin}
                selectedDepartment={selectedDepartment}
                selectedSemester={selectedSemester}
              />
            </motion.div>
          </motion.div>
        )}

        {activeTab === "assignments" && (
          <motion.div
            key="assignments"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
              <h2 className="text-xl font-semibold text-gray-100">All Assignments</h2>
              <DepartmentSelector
                selectedDepartment={selectedDepartment}
                selectedSemester={selectedSemester}
                onDepartmentChange={setSelectedDepartment}
                onSemesterChange={setSelectedSemester}
              />
            </div>
            <AssignmentsList 
              isAdmin={isAdmin}
              selectedDepartment={selectedDepartment}
              selectedSemester={selectedSemester}
            />
          </motion.div>
        )}

        {activeTab === "staff" && (
          <motion.div
            key="staff"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-gray-100 mb-4">
              {isAdmin ? "Staff Management" : "Staff Directory"}
            </h2>
            <StaffManagement isAdmin={isAdmin} />
          </motion.div>
        )}

        {activeTab === "subjects" && (
          <motion.div
            key="subjects"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-gray-100 mb-4">
              {isAdmin ? "Subject Management" : "Subject Directory"}
            </h2>
            <SubjectManagement isAdmin={isAdmin} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}