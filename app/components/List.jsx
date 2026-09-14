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
  console.log("List Loaded");

  const {
    state,
    setState,
    selectedDatasetId,
    setSelectedDatasetId,
    selectedSessionId,
    setSelectedSessionId,
    refreshTrigger,
    isRestoring,
  } = useApp();

  const [datasets, setDatasets] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch datasets when state === "data"
  useEffect(() => {
    if (isRestoring || state !== "data") {
      return;
    }

    const fetchDatasets = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("About to call backend");

        const res = await api.get("/datasets");

        console.log("Datasets response:", res.data);

        setDatasets(res.data);
      } catch (err) {
        console.error("Failed to fetch datasets:", err);
        setError("Failed to load datasets.");
      } finally {
        setLoading(false);
      }
    };

    fetchDatasets();
  }, [state, refreshTrigger, isRestoring]);

  // Fetch sessions for selected dataset when state === "session"
  useEffect(() => {
    if (
      isRestoring ||
      state !== "session" ||
      selectedDatasetId === null
    ) {
      return;
    }

    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(
          "Fetching sessions for dataset:",
          selectedDatasetId
        );

        const res = await api.get("/sessions", {
          params: {
            dataset_id: selectedDatasetId,
          },
        });

        console.log("Sessions response:", res.data);

        setSessions(res.data);
      } catch (err) {
        console.error("Failed to fetch sessions:", err);
        setError("Failed to load sessions.");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [
    state,
    selectedDatasetId,
    refreshTrigger,
    isRestoring,
  ]);

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
      {/* Header */}
      <div className="h-16 shrink-0 flex items-center justify-between px-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          {state === "session" && (
            <button
              onClick={handleBackToDatasets}
              className="p-1.5 rounded-md hover:bg-zinc-800 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
          )}

          {state === "data" ? (
            <>
              <Database size={18} />
              <span className="font-medium">Datasets</span>
            </>
          ) : (
            <>
              <MessageSquare size={18} />
              <span className="font-medium">Sessions</span>
            </>
          )}
        </div>

        <button
          className="p-1.5 rounded-md hover:bg-zinc-800 transition-colors"
          title={
            state === "data"
              ? "Create dataset"
              : "New session"
          }
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isRestoring || loading ? (
          <div className="flex items-center justify-center py-8 text-zinc-400">
            <Loader2
              size={20}
              className="animate-spin"
            />
          </div>
        ) : error ? (
          <div className="px-4 py-6 text-sm text-red-400">
            {error}
          </div>
        ) : state === "data" ? (
          datasets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center text-zinc-500">
              <FolderOpen
                size={32}
                className="mb-3"
              />
              <p className="text-sm">
                No datasets found.
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {datasets.map((dataset) => (
                <button
                  key={dataset.dataset_id}
                  onClick={() =>
                    handleDatasetClick(dataset)
                  }
                  className="w-full text-left px-3 py-3 rounded-lg hover:bg-zinc-800/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Database
                      size={18}
                      className="shrink-0 text-zinc-400"
                    />

                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {dataset.name ||
                          dataset.dataset_name ||
                          dataset.dataset_id}
                      </p>

                      {dataset.description && (
                        <p className="text-xs text-zinc-500 truncate mt-0.5">
                          {dataset.description}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )
        ) : (
          sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center text-zinc-500">
              <MessageSquare
                size={32}
                className="mb-3"
              />
              <p className="text-sm">
                No sessions found.
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() =>
                    handleSessionClick(session)
                  }
                  className={`w-full text-left px-3 py-3 rounded-lg transition-colors ${
                    selectedSessionId === session.id
                      ? "bg-zinc-800"
                      : "hover:bg-zinc-800/70"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare
                      size={18}
                      className="shrink-0 text-zinc-400"
                    />

                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {session.title ||
                          session.name ||
                          session.question ||
                          `Session ${session.id}`}
                      </p>

                      {session.created_at && (
                        <p className="text-xs text-zinc-500 truncate mt-0.5">
                          {new Date(
                            session.created_at
                          ).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )
        )}
      </div>
    </aside>
  );
}

