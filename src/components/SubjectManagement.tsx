"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface SubjectManagementProps {
  isAdmin: boolean;
}

export default function SubjectManagement({ isAdmin }: SubjectManagementProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    department: "",
  });

  const subjects = useQuery(api.subjects.list);
  const createSubject = useMutation(api.subjects.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.code || !formData.department) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createSubject(formData);
      setFormData({ name: "", code: "", department: "" });
      setIsAdding(false);
      toast.success("Subject added successfully!");
    } catch (error) {
      toast.error("Failed to add subject");
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Subject Form - Only for Admins */}
      {isAdmin && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-lg border border-gray-700">
          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 font-medium"
            >
              + Add New Subject
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-lg font-medium text-gray-100">Add New Subject</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Subject Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Advanced Mathematics"
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                    placeholder="e.g., MATH101"
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
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 font-medium"
                >
                  Add Subject
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setFormData({ name: "", code: "", department: "" });
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
          <div className="text-center py-8 text-gray-400">
            <p>No subjects added yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <div key={subject._id} className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-sm">
                <div className="space-y-2">
                  <div>
                    <div className="font-medium text-gray-100">{subject.name}</div>
                    <div className="text-sm text-gray-400 font-mono">{subject.code}</div>
                  </div>
                  
                  <div className="text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Department:</span>
                      <span className="font-medium text-gray-200">{subject.department}</span>
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