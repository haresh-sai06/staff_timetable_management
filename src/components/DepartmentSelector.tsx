"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { Building, Calendar } from "lucide-react";

interface DepartmentSelectorProps {
  selectedDepartment: string;
  selectedSemester: "odd" | "even";
  onDepartmentChange: (department: string) => void;
  onSemesterChange: (semester: "odd" | "even") => void;
}

export default function DepartmentSelector({
  selectedDepartment,
  selectedSemester,
  onDepartmentChange,
  onSemesterChange,
}: DepartmentSelectorProps) {
  const departments = useQuery(api.departments.list);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col sm:flex-row gap-4"
    >
      <div className="flex items-center space-x-2">
        <Building className="w-4 h-4 text-gray-400" />
        <select
          value={selectedDepartment}
          onChange={(e) => onDepartmentChange(e.target.value)}
          className="px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all min-w-[200px]"
        >
          <option value="">Select Department</option>
          {departments?.map((dept) => (
            <option key={dept._id} value={dept.code}>
              {dept.name} ({dept.code})
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <Calendar className="w-4 h-4 text-gray-400" />
        <select
          value={selectedSemester}
          onChange={(e) => onSemesterChange(e.target.value as "odd" | "even")}
          className="px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
        >
          <option value="odd">Odd Semester (Jul-Dec)</option>
          <option value="even">Even Semester (Jan-Jun)</option>
        </select>
      </div>
    </motion.div>
  );
}