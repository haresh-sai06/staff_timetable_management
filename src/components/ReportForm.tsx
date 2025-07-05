"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

const ISSUE_TYPES = [
  "Schedule Conflict",
  "Staff Availability",
  "Room Assignment",
  "Subject Error",
  "System Bug",
  "Other"
];

export default function ReportForm() {
  const [formData, setFormData] = useState({
    issueType: "",
    description: "",
    reason: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createReport = useMutation(api.reports.create);
  const userReports = useQuery(api.reports.list);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.issueType || !formData.description || !formData.reason) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await createReport(formData);
      setFormData({ issueType: "", description: "", reason: "" });
      toast.success("Report submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Submit Report Form */}
      <form onSubmit={handleSubmit} className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg font-medium text-gray-100 mb-4">Submit New Report</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Issue Type *
            </label>
            <select
              value={formData.issueType}
              onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">Select Issue Type</option>
              {ISSUE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the issue in detail..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Reason/Impact *
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Explain why this needs attention and its impact..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-md font-medium ${
              isSubmitting
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-blue-700 text-white hover:bg-blue-800"
            }`}
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </form>

      {/* User's Reports */}
      <div>
        <h3 className="text-lg font-medium text-gray-100 mb-4">Your Reports</h3>
        
        {!userReports ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
          </div>
        ) : userReports.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No reports submitted yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userReports.map((report: any) => (
              <div key={report._id} className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-100">{report.issueType}</h4>
                    <p className="text-sm text-gray-400">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    report.status === "resolved"
                      ? "bg-green-900 text-green-200"
                      : "bg-yellow-900 text-yellow-200"
                  }`}>
                    {report.status}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mb-2">{report.description}</p>
                <p className="text-sm text-gray-400">{report.reason}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}