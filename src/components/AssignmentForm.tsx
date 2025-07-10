"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Id } from "../../convex/_generated/dataModel";
import { AlertTriangle, CheckCircle, Clock, Users, MapPin } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIME_SLOTS = [
  "08:00-09:00", "09:00-10:00", "10:00-11:00", "11:00-12:00",
  "12:00-13:00", "13:00-14:00", "14:00-15:00", "15:00-16:00", "16:00-17:00"
];

interface AssignmentFormProps {
  selectedDepartment: string;
  selectedSemester: "odd" | "even";
}

export default function AssignmentForm({ selectedDepartment, selectedSemester }: AssignmentFormProps) {
  const [staffId, setStaffId] = useState<Id<"staff"> | "">("");
  const [subjectId, setSubjectId] = useState<Id<"subjects"> | "">("");
  const [classroomId, setClassroomId] = useState<Id<"classrooms"> | "">("");
  const [day, setDay] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const staff = useQuery(api.staff.list, { department: selectedDepartment });
  const subjects = useQuery(api.subjects.list, { 
    department: selectedDepartment, 
    semester: selectedSemester 
  });
  const classrooms = useQuery(api.classrooms.list);
  const createAssignment = useMutation(api.timetable.create);
  const checkConflicts = useMutation(api.timetable.checkConflicts);

  const staffWorkload = useQuery(
    api.staff.getWorkload,
    staffId && selectedDepartment && selectedSemester
      ? { staffId: staffId as Id<"staff">, department: selectedDepartment, semester: selectedSemester }
      : "skip"
  );

  const classroomAvailability = useQuery(
    api.classrooms.checkAvailability,
    classroomId && day && timeSlot
      ? { classroomId: classroomId as Id<"classrooms">, day, timeSlot }
      : "skip"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDepartment || !selectedSemester) {
      toast.error("Please select department and semester first");
      return;
    }

    if (!staffId || !subjectId || !classroomId || !day || !timeSlot) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      // Check conflicts before creating
      const conflictResult = await checkConflicts({
        department: selectedDepartment,
        semester: selectedSemester,
        staffId: staffId as Id<"staff">,
        subjectId: subjectId as Id<"subjects">,
        classroomId: classroomId as Id<"classrooms">,
        day,
        timeSlot,
      });

      if (conflictResult.hasConflicts) {
        toast.error(`Conflicts detected: ${conflictResult.conflicts.map(c => c.message).join(", ")}`);
        return;
      }

      await createAssignment({
        department: selectedDepartment,
        semester: selectedSemester,
        staffId: staffId as Id<"staff">,
        subjectId: subjectId as Id<"subjects">,
        classroomId: classroomId as Id<"classrooms">,
        day,
        timeSlot,
      });

      setStaffId("");
      setSubjectId("");
      setClassroomId("");
      setDay("");
      setTimeSlot("");
      
      toast.success("Assignment created successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create assignment");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedDepartment) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg border border-gray-700 text-center"
      >
        <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
        <p className="text-gray-300">Please select a department to create assignments</p>
      </motion.div>
    );
  }

  const canSubmit = staffId && subjectId && classroomId && day && timeSlot && 
                   (!classroomAvailability || classroomAvailability.isAvailable);

  return (
    <motion.form 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit} 
      className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg border border-gray-700"
    >
      <h3 className="text-lg font-medium text-gray-100 mb-4 flex items-center">
        <Clock className="w-5 h-5 mr-2" />
        Create New Assignment - {selectedDepartment} ({selectedSemester === "odd" ? "Jul-Dec" : "Jan-Jun"})
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Staff Member *
          </label>
          <select
            value={staffId}
            onChange={(e) => setStaffId(e.target.value as Id<"staff"> | "")}
            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            required
          >
            <option value="">Select Staff</option>
            {staff?.map((member) => (
              <option key={member._id} value={member._id}>
                {member.name} ({member.institutionRole})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Subject *
          </label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value as Id<"subjects"> | "")}
            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            required
          >
            <option value="">Select Subject</option>
            {subjects?.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.name} ({subject.code}) - {subject.type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Classroom *
          </label>
          <select
            value={classroomId}
            onChange={(e) => setClassroomId(e.target.value as Id<"classrooms"> | "")}
            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            required
          >
            <option value="">Select Classroom</option>
            {classrooms?.map((classroom) => (
              <option key={classroom._id} value={classroom._id}>
                {classroom.name} ({classroom.type}, {classroom.capacity} seats)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Day *
          </label>
          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            required
          >
            <option value="">Select Day</option>
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Time Slot *
          </label>
          <select
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            required
          >
            <option value="">Select Time</option>
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status Indicators */}
      <AnimatePresence>
        {staffId && staffWorkload && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 bg-gray-700 rounded-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Staff Workload:
              </span>
              <div className="flex items-center space-x-2">
                <div className={`text-sm font-medium ${
                  staffWorkload.utilizationPercentage > 90 ? "text-red-400" :
                  staffWorkload.utilizationPercentage > 75 ? "text-yellow-400" : "text-green-400"
                }`}>
                  {staffWorkload.currentHours}/{staffWorkload.maxHours} hours ({staffWorkload.utilizationPercentage}%)
                </div>
                {staffWorkload.utilizationPercentage <= 90 ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                )}
              </div>
            </div>
          </motion.div>
        )}

        {classroomId && day && timeSlot && classroomAvailability && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`mb-4 p-3 rounded-md ${
              classroomAvailability.isAvailable ? "bg-green-900 border border-green-700" : "bg-red-900 border border-red-700"
            }`}
          >
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              {classroomAvailability.isAvailable ? (
                <span className="text-sm text-green-200">Classroom is available</span>
              ) : (
                <span className="text-sm text-red-200">
                  Classroom occupied by {classroomAvailability.conflictWith?.staff} for {classroomAvailability.conflictWith?.subject}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: canSubmit ? 1.02 : 1 }}
          whileTap={{ scale: canSubmit ? 0.98 : 1 }}
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className={`px-6 py-2 rounded-md font-medium transition-all ${
            canSubmit && !isSubmitting
              ? "bg-blue-700 text-white hover:bg-blue-800 shadow-lg hover:shadow-xl"
              : "bg-gray-600 text-gray-400 cursor-not-allowed"
          }`}
        >
          {isSubmitting ? "Creating..." : "Create Assignment"}
        </motion.button>
      </div>
    </motion.form>
  );
}