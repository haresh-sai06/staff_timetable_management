"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, MapPin, Users, Monitor, FlaskConical } from "lucide-react";

const CLASSROOM_TYPES = [
  { value: "lecture_hall", label: "Lecture Hall", icon: Monitor },
  { value: "lab", label: "Laboratory", icon: FlaskConical },
  { value: "seminar_room", label: "Seminar Room", icon: Users },
];

export default function ClassroomManagement() {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    capacity: 30,
    type: "lecture_hall" as "lecture_hall" | "lab" | "seminar_room",
    department: "",
  });

  const classrooms = useQuery(api.classrooms.list);
  const departments = useQuery(api.departments.list);
  const createClassroom = useMutation(api.classrooms.create);
  const updateClassroom = useMutation(api.classrooms.update);
  const removeClassroom = useMutation(api.classrooms.remove);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.capacity) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const submitData = {
        ...formData,
        department: formData.department || undefined,
      };

      if (editingId) {
        await updateClassroom({ id: editingId as any, ...submitData });
        toast.success("Classroom updated successfully!");
        setEditingId(null);
      } else {
        await createClassroom(submitData);
        toast.success("Classroom added successfully!");
        setIsAdding(false);
      }
      setFormData({ name: "", capacity: 30, type: "lecture_hall", department: "" });
    } catch (error) {
      toast.error(editingId ? "Failed to update classroom" : "Failed to add classroom");
    }
  };

  const handleEdit = (classroom: any) => {
    setFormData({
      name: classroom.name,
      capacity: classroom.capacity,
      type: classroom.type,
      department: classroom.department || "",
    });
    setEditingId(classroom._id);
    setIsAdding(true);
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Are you sure you want to remove this classroom?")) {
      return;
    }

    try {
      await removeClassroom({ id: id as any });
      toast.success("Classroom removed successfully");
    } catch (error) {
      toast.error("Failed to remove classroom");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", capacity: 30, type: "lecture_hall", department: "" });
    setIsAdding(false);
    setEditingId(null);
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = CLASSROOM_TYPES.find(t => t.value === type);
    const Icon = typeConfig?.icon || MapPin;
    return <Icon className="w-4 h-4" />;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "lecture_hall": return "text-blue-400";
      case "lab": return "text-green-400";
      case "seminar_room": return "text-purple-400";
      default: return "text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Add/Edit Classroom Form */}
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
              Add New Classroom
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
                <MapPin className="w-5 h-5 mr-2" />
                {editingId ? "Edit Classroom" : "Add New Classroom"}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Classroom Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Room 101, Lab A"
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Capacity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                    required
                  />
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
                    {CLASSROOM_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Department (Optional)
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                  >
                    <option value="">Any Department</option>
                    {departments?.map((dept) => (
                      <option key={dept._id} value={dept.code}>
                        {dept.name} ({dept.code})
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
                  {editingId ? "Update Classroom" : "Add Classroom"}
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

      {/* Classrooms List */}
      <div>
        <h3 className="text-lg font-medium text-gray-100 mb-4">
          Current Classrooms ({classrooms?.length || 0})
        </h3>
        
        {!classrooms ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
          </div>
        ) : classrooms.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-gray-400"
          >
            <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No classrooms added yet.</p>
          </motion.div>
        ) : (
          <motion.div 
            layout
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence>
              {classrooms.map((classroom, index) => (
                <motion.div
                  key={classroom._id}
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
                        <span className={getTypeColor(classroom.type)}>
                          {getTypeIcon(classroom.type)}
                        </span>
                        <span className="ml-2">{classroom.name}</span>
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        {CLASSROOM_TYPES.find(t => t.value === classroom.type)?.label}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(classroom)}
                        className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                        title="Edit classroom"
                      >
                        <Edit2 className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleRemove(classroom._id)}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        title="Remove classroom"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Capacity:</span>
                      <span className="font-medium text-gray-200 flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {classroom.capacity}
                      </span>
                    </div>
                    {classroom.department && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Department:</span>
                        <span className="font-medium text-gray-200">{classroom.department}</span>
                      </div>
                    )}
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