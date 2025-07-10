"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Clock, Users, MapPin, BookOpen, Calendar } from "lucide-react";

interface AssignmentsListProps {
  isAdmin: boolean;
  selectedDepartment: string;
  selectedSemester: "odd" | "even";
}

export default function AssignmentsList({ 
  isAdmin, 
  selectedDepartment, 
  selectedSemester 
}: AssignmentsListProps) {
  const assignments = useQuery(
    api.timetable.list,
    selectedDepartment ? { department: selectedDepartment, semester: selectedSemester } : "skip"
  );
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

  if (!selectedDepartment) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12 text-gray-400"
      >
        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Please select a department to view assignments</p>
      </motion.div>
    );
  }

  if (!assignments) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8 text-gray-400"
      >
        <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No assignments found for {selectedDepartment} - {selectedSemester === "odd" ? "Odd Semester" : "Even Semester"}.</p>
        {isAdmin && <p className="text-sm mt-1">Use the schedule tab to create your first assignment.</p>}
      </motion.div>
    );
  }

  const groupedAssignments = assignments.reduce((acc, assignment) => {
    if (!acc[assignment.day]) {
      acc[assignment.day] = [];
    }
    acc[assignment.day].push(assignment);
    return acc;
  }, {} as Record<string, typeof assignments>);

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const getSubjectTypeColor = (type: string) => {
    switch (type) {
      case "lab": return "text-green-400";
      case "theory": return "text-blue-400";
      default: return "text-gray-400";
    }
  };

  const getSubjectTypeIcon = (type: string) => {
    switch (type) {
      case "lab": return "🧪";
      case "theory": return "📖";
      default: return "📚";
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Summary */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 p-4 rounded-lg border border-gray-700"
      >
        <h4 className="font-medium text-gray-100 mb-2 flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          Assignment Summary - {selectedDepartment} ({selectedSemester === "odd" ? "Jul-Dec" : "Jan-Jun"})
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{assignments.length}</div>
            <div className="text-gray-400">Total Assignments</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {assignments.filter(a => a.subjectType === "lab").length}
            </div>
            <div className="text-gray-400">Lab Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {assignments.filter(a => a.subjectType === "theory").length}
            </div>
            <div className="text-gray-400">Theory Classes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">
              {Object.keys(groupedAssignments).length}
            </div>
            <div className="text-gray-400">Active Days</div>
          </div>
        </div>
      </motion.div>

      {/* Assignments by Day */}
      <AnimatePresence>
        {DAYS.map((day) => {
          const dayAssignments = groupedAssignments[day] || [];
          if (dayAssignments.length === 0) return null;

          const sortedAssignments = dayAssignments.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

          return (
            <motion.div 
              key={day}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 border border-gray-700"
            >
              <h3 className="text-lg font-semibold text-gray-100 mb-3 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                {day} ({sortedAssignments.length} assignments)
              </h3>
              
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                  {sortedAssignments.map((assignment, index) => (
                    <motion.div
                      key={assignment._id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-gray-100 flex items-center">
                            <span className={getSubjectTypeColor(assignment.subjectType)}>
                              {getSubjectTypeIcon(assignment.subjectType)}
                            </span>
                            <span className="ml-2">{assignment.timeSlot}</span>
                          </div>
                          <div className="text-sm text-gray-400">
                            {assignment.subjectName} ({assignment.subjectCode})
                          </div>
                        </div>
                        {isAdmin && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleRemove(assignment._id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-500 p-1"
                            title="Remove assignment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center text-gray-400">
                          <Users className="w-3 h-3 mr-2" />
                          <span className="font-medium text-gray-200">{assignment.staffName}</span>
                        </div>
                        <div className="flex items-center text-gray-400">
                          <MapPin className="w-3 h-3 mr-2" />
                          <span>{assignment.classroomName}</span>
                          <span className="ml-1 text-xs">({assignment.classroomType})</span>
                        </div>
                        <div className="flex items-center text-gray-400">
                          <BookOpen className="w-3 h-3 mr-2" />
                          <span className={getSubjectTypeColor(assignment.subjectType)}>
                            {assignment.subjectType === "lab" ? "Laboratory" : "Theory"}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {Object.keys(groupedAssignments).length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 text-gray-400"
        >
          <p>No assignments found for the selected filters.</p>
        </motion.div>
      )}
    </motion.div>
  );
}