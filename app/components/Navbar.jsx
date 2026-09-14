"use client";

import { useRef, useState } from "react";
import {
  ArrowLeft,
  Brain,
  Upload,
  Activity,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
} from "lucide-react";
import api from "@/app/lib/api";
import { useApp } from "@/app/context/AppContext";

export default function Navbar() {
  const { selectedDatasetId, goBack } = useApp();

  const fileInputRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [statusData, setStatusData] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];

    if (!file || !selectedDatasetId) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      await api.post(`/datasets/${selectedDatasetId}/upload`, formData);
      alert("Document uploaded successfully");
    } catch (error) {
      console.error("Failed to upload file:", error);
      alert("Failed to upload document");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleCheckStatus = async () => {
    if (!selectedDatasetId) return;

    try {
      setStatusLoading(true);
      setShowStatus(true);
      const res = await api.get(`/datasets/${selectedDatasetId}/upload-status`);
      setStatusData(res.data);
    } catch (error) {
      console.error("Failed to get upload status:", error);
      setStatusData(null);
    } finally {
      setStatusLoading(false);
    }
  };

  const canGoBack = selectedDatasetId !== null;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 z-50 px-4 md:px-6 flex items-center justify-between">
        {/* Left Side Navigation */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={goBack}
            disabled={!canGoBack}
            title="Go Back"
            aria-label="Go Back"
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-zinc-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <Brain className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="font-semibold text-zinc-100 text-sm md:text-base tracking-tight">
              AI Research Buddy
            </span>
          </div>

          {selectedDatasetId && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-zinc-900 border border-zinc-800 text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {selectedDatasetId.slice(0, 8)}...
            </span>
          )}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {selectedDatasetId !== null && (
            <>
              <button
                type="button"
                onClick={handleUploadClick}
                disabled={uploading}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs md:text-sm font-medium transition shadow-sm disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <span>{uploading ? "Uploading..." : "Upload Document"}</span>
              </button>

              <button
                type="button"
                onClick={handleCheckStatus}
                title="Check Document Upload Status"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-900 text-zinc-300 text-xs md:text-sm font-medium transition"
              >
                <Activity className="w-4 h-4 text-zinc-400" />
                <span className="hidden md:inline">Check Status</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                hidden
                onChange={handleFileChange}
              />
            </>
          )}
        </div>
      </header>

      {/* Document Upload Status Modal */}
      {showStatus && (
        <div className="status-overlay">
          <div className="status-modal custom-scrollbar">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-semibold text-zinc-100">
                  Document Status
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowStatus(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {statusLoading ? (
              <div className="flex flex-col items-center justify-center py-8 text-zinc-400 gap-3">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                <p className="text-sm">Checking document status...</p>
              </div>
            ) : statusData ? (
              <div className="space-y-4">
                <p className="text-xs font-mono text-zinc-400 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800">
                  Dataset ID: {statusData.dataset_id}
                </p>

                {statusData.documents.length === 0 ? (
                  <div className="p-6 text-center text-zinc-400 text-sm bg-zinc-900/40 rounded-xl border border-zinc-800/60">
                    No documents uploaded to this dataset yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {statusData.documents.map((doc) => (
                      <div
                        key={doc.document_id}
                        className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm text-zinc-200 truncate">
                            {doc.filename}
                          </h4>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              doc.status === "ready" || doc.status === "completed"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : doc.status === "failed"
                                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {doc.status === "ready" || doc.status === "completed" ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : doc.status === "failed" ? (
                              <AlertCircle className="w-3.5 h-3.5" />
                            ) : (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            )}
                            <span className="capitalize">{doc.status}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-zinc-500">
                          <span>
                            {(doc.size_bytes / 1024).toFixed(1)} KB
                          </span>
                          <span>•</span>
                          <span>
                            Uploaded:{" "}
                            {new Date(doc.created_at).toLocaleString()}
                          </span>
                        </div>

                        {doc.error_message && doc.status === "failed" && (
                          <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs mt-2">
                            {doc.error_message}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                Failed to load document status.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}