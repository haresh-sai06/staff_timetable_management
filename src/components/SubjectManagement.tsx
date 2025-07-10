"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, BookOpen, FlaskConical, Calendar } from "lucide-react";

interface SubjectManagementProps {
  isAdmin: boolean;
}

const SUBJECT_TYPES = [
  { value: "theory", label: "Theory", icon: BookOpen, color: "text-blue-400" },
  { value: "lab", label: "Laboratory", icon: FlaskConical, color: "text-green-400" },
];

const SEMESTERS = [
  { value: "odd", label: "Odd Semester (Jul-Dec)", color: "text-orange-400" },
  { value: "even", label: "Even Semester (Jan-Jun)", color: "text-cyan-400" },
];

export default function SubjectManagement({ isAdmin }: SubjectManagementProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    credits: 3,
    semester: "odd" as "odd" | "even",
    department: "",
    type: "theory" as "theory" | "lab",
  });

  const subjects = useQuery(api.subjects.list);
  const departments = useQuery(api.departments.list);
  const createSubject = useMutation(api.subjects.create);
  const updateSubject = useMutation(api.subjects.update);
  const removeSubject = useMutation(api.subjects.remove);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.code || !formData.department) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingId) {
        await updateSubject({ id: editingId as any, ...formData });
        toast.success("Subject updated successfully!");
        setEditingId(null);
      } else {
        await createSubject(formData);
        toast.success("Subject added successfully!");
        setIsAdding(false);
      }
      setFormData({ name: "", code: "", credits: 3, semester: "odd", department: "", type: "theory" });
    } catch (error) {
      toast.error(editingId ? "Failed to update subject" : "Failed to add subject");
    }
  };

  const handleEdit = (subject: any) => {
    setFormData({
      name: subject.name,
      code: subject.code,
      credits: subject.credits,
      semester: subject.semester,
      department: subject.department,
      type: subject.type,
    });
    setEditingId(subject._id);
    setIsAdding(true);
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Are you sure you want to remove this subject?")) {
      return;
    }

    try {
      await removeSubject({ id: id as any });
      toast.success("Subject removed successfully");
    } catch (error) {
      toast.error("Failed to remove subject");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", code: "", credits: 3, semester: "odd", department: "", type: "theory" });
    setIsAdding(false);
    setEditingId(null);
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = SUBJECT_TYPES.find(t => t.value === type);
    const Icon = typeConfig?.icon || BookOpen;
    return <Icon className="w-4 h-4" />;
  };

  const getTypeColor = (type: string) => {
    return SUBJECT_TYPES.find(t => t.value === type)?.color || "text-gray-400";
  };

  const getSemesterColor = (semester: string) => {
    return SEMESTERS.find(s => s.value === semester)?.color || "text-gray-400";
  };

  return (
    <div className="space-y-6">
      {/* Add/Edit Subject Form - Only for Admins */}
      {isAdmin && (
        <motion.div 
          layout
          className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-lg border border-gray-700"
        >
          <AnimatePresence mode="wait">
            {!isAdding ? (
              <motion.button
                key="add-button"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsAdding(true)}
                className="flex items-center px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 font-medium transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Subject
              </motion.button>
            ) : (
              <motion.form
                key="add-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <h3 className="text-lg font-medium text-gray-100 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  {editingId ? "Edit Subject" : "Add New Subject"}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Subject Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Data Structures and Algorithms"
                      className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Subject Code *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="e.g., CS201"
                      className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Credits *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="6"
                      value={formData.credits}
                      onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Semester *
                    </label>
                    <select
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                      required
                    >
                      {SEMESTERS.map((semester) => (
                        <option key={semester.value} value={semester.value}>
                          {semester.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Department *
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                      required
                    >
                      <option value="">Select Department</option>
                      {departments?.map((dept) => (
                        <option key={dept._id} value={dept.code}>
                          {dept.name} ({dept.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                      required
                    >
                      {SUBJECT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 font-medium transition-colors"
                  >
                    {editingId ? "Update Subject" : "Add Subject"}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-700 font-medium transition-colors"
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Subjects List */}
      <div>
        <h3 className="text-lg font-medium text-gray-100 mb-4">
          {isAdmin ? "Current Subjects" : "Subject Directory"} ({subjects?.length || 0})
        </h3>
        
        {!subjects ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
          </div>
        ) : subjects.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-gray-400"
          >
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No subjects added yet.</p>
          </motion.div>
        ) : (
          <motion.div 
            layout
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence>
              {subjects.map((subject, index) => (
                <motion.div
                  key={subject._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="font-medium text-gray-100 flex items-center">
                        <span className={getTypeColor(subject.type)}>
                          {getTypeIcon(subject.type)}
                        </span>
                        <span className="ml-2">{subject.name}</span>
                      </div>
                      <div className="text-sm text-gray-400 font-mono mt-1">{subject.code}</div>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEdit(subject)}
                          className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                          title="Edit subject"
                        >
                          <Edit2 className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRemove(subject._id)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                          title="Remove subject"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Department:</span>
                      <span className="font-medium text-gray-200">{subject.department}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Type:</span>
                      <span className={`font-medium flex items-center ${getTypeColor(subject.type)}`}>
                        {getTypeIcon(subject.type)}
                        <span className="ml-1">{SUBJECT_TYPES.find(t => t.value === subject.type)?.label}</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Semester:</span>
                      <span className={`font-medium flex items-center ${getSemesterColor(subject.semester)}`}>
                        <Calendar className="w-3 h-3 mr-1" />
                        {subject.semester === "odd" ? "Odd (Jul-Dec)" : "Even (Jan-Jun)"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Credits:</span>
                      <span className="font-medium text-gray-200">{subject.credits}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}