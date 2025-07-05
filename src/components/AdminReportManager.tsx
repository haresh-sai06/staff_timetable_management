"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export default function AdminReportManager() {
  const reports = useQuery(api.reports.list);
  const updateReportStatus = useMutation(api.reports.updateStatus);

  const handleStatusUpdate = async (reportId: string, status: "pending" | "resolved") => {
    try {
      await updateReportStatus({ reportId: reportId as any, status });
      toast.success(`Report marked as ${status}`);
    } catch (error) {
      toast.error("Failed to update report status");
    }
  };

  if (!reports) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>No reports submitted yet.</p>
      </div>
    );
  }

  const pendingReports = reports.filter((r: any) => r.status === "pending");
  const resolvedReports = reports.filter((r: any) => r.status === "resolved");

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-yellow-900 p-4 rounded-lg border border-yellow-700">
          <div className="text-2xl font-bold text-yellow-200">{pendingReports.length}</div>
          <div className="text-sm text-yellow-400">Pending Reports</div>
        </div>
        <div className="bg-green-900 p-4 rounded-lg border border-green-700">
          <div className="text-2xl font-bold text-green-200">{resolvedReports.length}</div>
          <div className="text-sm text-green-400">Resolved Reports</div>
        </div>
        <div className="bg-blue-900 p-4 rounded-lg border border-blue-700">
          <div className="text-2xl font-bold text-blue-200">{reports.length}</div>
          <div className="text-sm text-blue-400">Total Reports</div>
        </div>
      </div>

      {/* Pending Reports */}
      {pendingReports.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-100 mb-4">
            Pending Reports ({pendingReports.length})
          </h3>
          <div className="space-y-4">
            {pendingReports.map((report: any) => (
              <div key={report._id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-gray-100">{report.issueType}</h4>
                    <p className="text-sm text-gray-400">
                      By: {report.userName} • {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleStatusUpdate(report._id, "resolved")}
                    className="px-3 py-1 bg-green-700 text-white text-sm rounded-md hover:bg-green-800"
                  >
                    Mark Resolved
                  </button>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-300">Description:</span>
                    <p className="text-sm text-gray-400">{report.description}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-300">Reason/Impact:</span>
                    <p className="text-sm text-gray-400">{report.reason}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resolved Reports */}
      {resolvedReports.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-100 mb-4">
            Resolved Reports ({resolvedReports.length})
          </h3>
          <div className="space-y-4">
            {resolvedReports.map((report: any) => (
              <div key={report._id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-gray-100">{report.issueType}</h4>
                    <p className="text-sm text-gray-400">
                      By: {report.userName} • Submitted: {new Date(report.createdAt).toLocaleDateString()}
                      {report.resolvedAt && ` • Resolved: ${new Date(report.resolvedAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleStatusUpdate(report._id, "pending")}
                    className="px-3 py-1 bg-yellow-700 text-white text-sm rounded-md hover:bg-yellow-800"
                  >
                    Reopen
                  </button>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-300">Description:</span>
                    <p className="text-sm text-gray-400">{report.description}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-300">Reason/Impact:</span>
                    <p className="text-sm text-gray-400">{report.reason}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}