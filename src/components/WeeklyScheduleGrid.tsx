"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Users, MapPin, BookOpen } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIME_SLOTS = [
  "08:00-09:00", "09:00-10:00", "10:00-11:00", "11:00-12:00",
  "12:00-13:00", "13:00-14:00", "14:00-15:00", "15:00-16:00", "16:00-17:00"
];

interface WeeklyScheduleGridProps {
  isAdmin: boolean;
  selectedDepartment: string;
  selectedSemester: "odd" | "even";
}

export default function WeeklyScheduleGrid({ 
  isAdmin, 
  selectedDepartment, 
  selectedSemester 
}: WeeklyScheduleGridProps) {
  const schedule = useQuery(
    api.timetable.getWeeklySchedule,
    selectedDepartment ? { department: selectedDepartment, semester: selectedSemester } : "skip"
  );
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

  if (!selectedDepartment) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12 text-gray-400"
      >
        <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Please select a department to view the schedule</p>
      </motion.div>
    );
  }

  if (!schedule) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  const getSubjectTypeColor = (type: string) => {
    switch (type) {
      case "lab": return "bg-green-900 border-green-700 text-green-200";
      case "theory": return "bg-blue-900 border-blue-700 text-blue-200";
      default: return "bg-gray-900 border-gray-700 text-gray-200";
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
      className="overflow-x-auto"
    >
      <div className="min-w-full">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-7 gap-1 mb-2"
        >
          <div className="p-3 font-semibold text-center bg-gray-800 text-gray-100 rounded flex items-center justify-center">
            <Clock className="w-4 h-4 mr-2" />
            Time
          </div>
          {DAYS.map((day, index) => (
            <motion.div 
              key={day}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 font-semibold text-center bg-gray-800 text-gray-100 rounded"
            >
              {day}
            </motion.div>
          ))}
        </motion.div>

        {/* Schedule Grid */}
        <AnimatePresence>
          {TIME_SLOTS.map((timeSlot, timeIndex) => (
            <motion.div 
              key={timeSlot}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: timeIndex * 0.05 }}
              className="grid grid-cols-7 gap-1 mb-1"
            >
              <div className="p-3 text-center bg-gray-700 text-gray-100 rounded font-medium text-sm">
                {timeSlot}
              </div>
              
              {DAYS.map((day, dayIndex) => (
                <motion.div 
                  key={`${day}-${timeSlot}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (timeIndex * 6 + dayIndex) * 0.02 }}
                  className="min-h-[100px] p-1 bg-gray-900 border border-gray-700 rounded"
                >
                  <AnimatePresence>
                    {schedule[day]?.[timeSlot]?.map((assignment: any, index: number) => (
                      <motion.div
                        key={assignment._id}
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -20 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        transition={{ duration: 0.2, delay: index * 0.1 }}
                        className={`mb-1 p-2 border rounded text-xs group relative cursor-pointer ${getSubjectTypeColor(assignment.subjectType)}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium flex items-center">
                            <span className="mr-1">{getSubjectTypeIcon(assignment.subjectType)}</span>
                            {assignment.subjectCode}
                          </div>
                          {isAdmin && (
                            <motion.button
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.8 }}
                              onClick={() => handleRemoveAssignment(assignment._id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center hover:bg-red-700"
                              title="Remove assignment"
                            >
                              <X className="w-2 h-2" />
                            </motion.button>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center text-xs opacity-90">
                            <Users className="w-3 h-3 mr-1" />
                            <span className="truncate">{assignment.staffName}</span>
                          </div>
                          <div className="flex items-center text-xs opacity-90">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span className="truncate">{assignment.classroomName}</span>
                          </div>
                        </div>
                        
                        {/* Tooltip */}
                        <div className="absolute z-20 invisible group-hover:visible bg-gray-800 text-gray-100 text-xs rounded py-2 px-3 -top-2 left-full ml-2 whitespace-nowrap shadow-lg border border-gray-600">
                          <div className="font-medium mb-1 flex items-center">
                            <BookOpen className="w-3 h-3 mr-1" />
                            {assignment.subjectName}
                          </div>
                          <div className="space-y-1 text-xs">
                            <div>👨‍🏫 {assignment.staffName}</div>
                            <div>🏛️ {assignment.classroomName} ({assignment.classroomType})</div>
                            <div>📚 {assignment.subjectType === "lab" ? "Laboratory" : "Theory"}</div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-4 bg-gray-800 rounded border border-gray-700"
      >
        <h4 className="font-medium text-gray-100 mb-3 flex items-center">
          <BookOpen className="w-4 h-4 mr-2" />
          Legend
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-300">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-900 border border-blue-700 rounded"></div>
            <span>📖 Theory Classes</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-900 border border-green-700 rounded"></div>
            <span>🧪 Laboratory Sessions</span>
          </div>
          <div>• Hover over assignments to see full details</div>
          {isAdmin && <div>• Click × to remove an assignment</div>}
          <div>• Empty cells indicate available time slots</div>
          <div>• {selectedSemester === "odd" ? "Odd Semester (July-December)" : "Even Semester (January-June)"}</div>
        </div>
      </motion.div>
    </motion.div>
  );
}