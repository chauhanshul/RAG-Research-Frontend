"use client";

import { useEffect, useState } from "react";
import {
  Database,
  MessageSquare,
  Plus,
  ChevronLeft,
  Loader2,
  FolderOpen,
} from "lucide-react";
import api from "@/app/lib/api";
import { useApp } from "@/app/context/AppContext";

export default function List() {
  const {
    state,
    setState,
    selectedDatasetId,
    setSelectedDatasetId,
    selectedSessionId,
    setSelectedSessionId,
    refreshTrigger,
  } = useApp();

  const [datasets, setDatasets] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch datasets when state === "data"
  useEffect(() => {
    if (state !== "data") {
      return;
    }

    const fetchDatasets = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("About to call backend");
        const res = await api.get("/datasets");
        setDatasets(res.data);
      } catch (err) {
        console.error("Failed to fetch datasets:", err);
        setError("Failed to load datasets.");
      } finally {
        setLoading(false);
      }
    };

    fetchDatasets();
  }, [state, refreshTrigger]);

  // Fetch sessions for selected dataset when state === "session"
  useEffect(() => {
    if (state !== "session" || selectedDatasetId === null) {
      return;
    }

    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/sessions", {
          params: { dataset_id: selectedDatasetId },
        });
        setSessions(res.data);
      } catch (err) {
        console.error("Failed to fetch sessions:", err);
        setError("Failed to load sessions.");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [state, selectedDatasetId, refreshTrigger]);

  const handleDatasetClick = (dataset) => {
    setSelectedDatasetId(dataset.dataset_id);
    setSelectedSessionId(null);
    setState("session");
  };

  const handleSessionClick = (session) => {
    setSelectedSessionId(session.id);
  };

  const handleBackToDatasets = () => {
    setSelectedSessionId(null);
    setSelectedDatasetId(null);
    setState("data");
  };

  return (
    <aside className="w-full md:w-[320px] lg:w-[360px] shrink-0 h-full flex flex-col bg-zinc-900/40 border-r border-zinc-800/80 overflow-hidden">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
        {state === "session" ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBackToDatasets}
              title="Back to Datasets"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="font-semibold text-zinc-100 text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              Sessions
            </h2>
          </div>
        ) : (
          <h2 className="font-semibold text-zinc-100 text-sm flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-400" />
            Datasets
          </h2>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-500 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
            <span className="text-xs">Loading items...</span>
          </div>
        ) : error ? (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        ) : state === "data" ? (
          /* Datasets List */
          datasets.length === 0 ? (
            <div className="p-6 text-center text-zinc-500 text-xs bg-zinc-900/30 rounded-xl border border-zinc-800/50 space-y-2">
              <FolderOpen className="w-8 h-8 mx-auto text-zinc-600" />
              <p>No datasets created yet.</p>
            </div>
          ) : (
            datasets.map((dataset) => {
              const isSelected = selectedDatasetId === dataset.dataset_id;
              return (
                <button
                  key={dataset.dataset_id}
                  type="button"
                  onClick={() => handleDatasetClick(dataset)}
                  className={`w-full text-left p-3 rounded-xl border transition flex items-start gap-3 ${
                    isSelected
                      ? "bg-indigo-600/15 border-indigo-500/40 text-indigo-100"
                      : "bg-zinc-900/40 border-zinc-800/60 hover:bg-zinc-800/60 hover:border-zinc-700 text-zinc-300"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg mt-0.5 ${
                      isSelected
                        ? "bg-indigo-600/20 text-indigo-400"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    <Database className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-xs md:text-sm text-zinc-100 truncate">
                      {dataset.name || "Untitled Dataset"}
                    </div>
                    <div className="text-[11px] font-mono text-zinc-500 truncate mt-0.5">
                      {dataset.dataset_id.slice(0, 13)}...
                    </div>
                  </div>
                </button>
              );
            })
          )
        ) : state === "session" ? (
          /* Sessions List */
          sessions.length === 0 ? (
            <div className="p-6 text-center text-zinc-500 text-xs bg-zinc-900/30 rounded-xl border border-zinc-800/50 space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-zinc-600" />
              <p>No chat sessions in this dataset yet.</p>
            </div>
          ) : (
            sessions.map((session) => {
              const isSelected = selectedSessionId === session.id;
              return (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => handleSessionClick(session)}
                  className={`w-full text-left p-3 rounded-xl border transition flex items-start gap-3 ${
                    isSelected
                      ? "bg-emerald-600/15 border-emerald-500/40 text-emerald-100"
                      : "bg-zinc-900/40 border-zinc-800/60 hover:bg-zinc-800/60 hover:border-zinc-700 text-zinc-300"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg mt-0.5 ${
                      isSelected
                        ? "bg-emerald-600/20 text-emerald-400"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-xs md:text-sm text-zinc-100 truncate">
                      Session {session.id.slice(0, 8)}
                    </div>
                    {session.created_at && (
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        {new Date(session.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          )
        ) : null}
      </div>
    </aside>
  );
}