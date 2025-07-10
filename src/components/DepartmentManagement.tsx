"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Building } from "lucide-react";

export default function DepartmentManagement() {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
  });

  const departments = useQuery(api.departments.list);
  const createDepartment = useMutation(api.departments.create);
  const updateDepartment = useMutation(api.departments.update);
  const removeDepartment = useMutation(api.departments.remove);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.code) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingId) {
        await updateDepartment({ id: editingId as any, ...formData });
        toast.success("Department updated successfully!");
        setEditingId(null);
      } else {
        await createDepartment(formData);
        toast.success("Department added successfully!");
        setIsAdding(false);
      }
      setFormData({ name: "", code: "" });
    } catch (error) {
      toast.error(editingId ? "Failed to update department" : "Failed to add department");
    }
  };

  const handleEdit = (department: any) => {
    setFormData({ name: department.name, code: department.code });
    setEditingId(department._id);
    setIsAdding(true);
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Are you sure you want to remove this department?")) {
      return;
    }

    try {
      await removeDepartment({ id: id as any });
      toast.success("Department removed successfully");
    } catch (error) {
      toast.error("Failed to remove department");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", code: "" });
    setIsAdding(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Add/Edit Department Form */}
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
              Add New Department
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
                <Building className="w-5 h-5 mr-2" />
                {editingId ? "Edit Department" : "Add New Department"}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Computer Science and Engineering"
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Department Code *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g., CSE"
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 font-medium transition-colors"
                >
                  {editingId ? "Update Department" : "Add Department"}
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

      {/* Departments List */}
      <div>
        <h3 className="text-lg font-medium text-gray-100 mb-4">
          Current Departments ({departments?.length || 0})
        </h3>
        
        {!departments ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
          </div>
        ) : departments.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-gray-400"
          >
            <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No departments added yet.</p>
          </motion.div>
        ) : (
          <motion.div 
            layout
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence>
              {departments.map((department, index) => (
                <motion.div
                  key={department._id}
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
                        <Building className="w-4 h-4 mr-2 text-blue-400" />
                        {department.name}
                      </div>
                      <div className="text-sm text-gray-400 font-mono mt-1">
                        {department.code}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(department)}
                        className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                        title="Edit department"
                      >
                        <Edit2 className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleRemove(department._id)}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        title="Remove department"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
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