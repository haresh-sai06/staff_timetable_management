"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface StaffManagementProps {
  isAdmin: boolean;
}

export default function StaffManagement({ isAdmin }: StaffManagementProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    maxPeriodsPerDay: 6,
  });

  const staff = useQuery(api.staff.list);
  const createStaff = useMutation(api.staff.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.department) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createStaff(formData);
      setFormData({ name: "", email: "", department: "", maxPeriodsPerDay: 6 });
      setIsAdding(false);
      toast.success("Staff member added successfully!");
    } catch (error) {
      toast.error("Failed to add staff member");
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Staff Form - Only for Admins */}
      {isAdmin && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-lg border border-gray-700">
          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 font-medium"
            >
              + Add New Staff Member
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-lg font-medium text-gray-100">Add New Staff Member</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="English">English</option>
                    <option value="History">History</option>
                    <option value="Physical Education">Physical Education</option>
                    <option value="Arts">Arts</option>
                    <option value="Computer Science">Computer Science</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Max Periods Per Day
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={formData.maxPeriodsPerDay}
                    onChange={(e) => setFormData({ ...formData, maxPeriodsPerDay: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 font-medium"
                >
                  Add Staff Member
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setFormData({ name: "", email: "", department: "", maxPeriodsPerDay: 6 });
                  }}
                  className="px-4 py-2 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-700 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
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
          <div className="text-center py-8 text-gray-400">
            <p>No staff members added yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {staff.map((member) => (
              <div key={member._id} className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-sm">
                <div className="space-y-2">
                  <div>
                    <div className="font-medium text-gray-100">{member.name}</div>
                    <div className="text-sm text-gray-400">{member.email}</div>
                  </div>
                  
                  <div className="text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Department:</span>
                      <span className="font-medium text-gray-200">{member.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Max Periods/Day:</span>
                      <span className="font-medium text-gray-200">{member.maxPeriodsPerDay}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}