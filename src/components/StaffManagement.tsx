"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, User, Clock, Award } from "lucide-react";

interface StaffManagementProps {
  isAdmin: boolean;
}

const INSTITUTION_ROLES = [
  { value: "Assistant Professor", label: "Assistant Professor", hours: 18, color: "text-blue-400" },
  { value: "Professor", label: "Professor", hours: 12, color: "text-purple-400" },
];

export default function StaffManagement({ isAdmin }: StaffManagementProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    institutionRole: "Assistant Professor" as "Assistant Professor" | "Professor",
  });

  const staff = useQuery(api.staff.list);
  const departments = useQuery(api.departments.list);
  const createStaff = useMutation(api.staff.create);
  const updateStaff = useMutation(api.staff.update);
  const removeStaff = useMutation(api.staff.remove);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.department) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingId) {
        await updateStaff({ id: editingId as any, ...formData });
        toast.success("Staff member updated successfully!");
        setEditingId(null);
      } else {
        await createStaff(formData);
        toast.success("Staff member added successfully!");
        setIsAdding(false);
      }
      setFormData({ name: "", email: "", department: "", institutionRole: "Assistant Professor" });
    } catch (error) {
      toast.error(editingId ? "Failed to update staff member" : "Failed to add staff member");
    }
  };

  const handleEdit = (member: any) => {
    setFormData({
      name: member.name,
      email: member.email,
      department: member.department,
      institutionRole: member.institutionRole,
    });
    setEditingId(member._id);
    setIsAdding(true);
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Are you sure you want to remove this staff member?")) {
      return;
    }

    try {
      await removeStaff({ id: id as any });
      toast.success("Staff member removed successfully");
    } catch (error) {
      toast.error("Failed to remove staff member");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", department: "", institutionRole: "Assistant Professor" });
    setIsAdding(false);
    setEditingId(null);
  };

  const getRoleColor = (role: string) => {
    return INSTITUTION_ROLES.find(r => r.value === role)?.color || "text-gray-400";
  };

  const getRoleHours = (role: string) => {
    return INSTITUTION_ROLES.find(r => r.value === role)?.hours || 18;
  };

  return (
    <div className="space-y-6">
      {/* Add/Edit Staff Form - Only for Admins */}
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
                Add New Staff Member
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
                  <User className="w-5 h-5 mr-2" />
                  {editingId ? "Edit Staff Member" : "Add New Staff Member"}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Dr. John Smith"
                      className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john.smith@college.edu"
                      className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                      required
                    />
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
                      Institution Role *
                    </label>
                    <select
                      value={formData.institutionRole}
                      onChange={(e) => setFormData({ ...formData, institutionRole: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                      required
                    >
                      {INSTITUTION_ROLES.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label} ({role.hours}h/week)
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
                    {editingId ? "Update Staff Member" : "Add Staff Member"}
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

      {/* Staff List */}
      <div>
        <h3 className="text-lg font-medium text-gray-100 mb-4">
          {isAdmin ? "Current Staff" : "Staff Directory"} ({staff?.length || 0})
        </h3>
        
        {!staff ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
          </div>
        ) : staff.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-gray-400"
          >
            <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No staff members added yet.</p>
          </motion.div>
        ) : (
          <motion.div 
            layout
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence>
              {staff.map((member, index) => (
                <motion.div
                  key={member._id}
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
                        <User className="w-4 h-4 mr-2 text-blue-400" />
                        {member.name}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">{member.email}</div>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEdit(member)}
                          className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                          title="Edit staff member"
                        >
                          <Edit2 className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRemove(member._id)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                          title="Remove staff member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Department:</span>
                      <span className="font-medium text-gray-200">{member.department}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Role:</span>
                      <span className={`font-medium flex items-center ${getRoleColor(member.institutionRole)}`}>
                        <Award className="w-3 h-3 mr-1" />
                        {member.institutionRole}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Max Hours/Week:</span>
                      <span className="font-medium text-gray-200 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {member.maxHours}h
                      </span>
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