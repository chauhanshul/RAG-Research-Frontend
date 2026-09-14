"use client";

import { useState } from "react";
import { PlusCircle, MessageSquarePlus, Database, Sparkles, Loader2 } from "lucide-react";
import api from "@/app/lib/api";
import { useApp } from "@/app/context/AppContext";
import Form from "@/app/components/Form";
import Window from "@/app/components/Window";

export default function View() {
  console.log("View Loaded")
  const {
    state,
    selectedDatasetId,
    selectedSessionId,
    setSelectedSessionId,
    refreshList,
  } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreateSession = async () => {
    if (selectedDatasetId === null) {
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/sessions", {
        dataset_id: selectedDatasetId,
      });

      refreshList();
      setSelectedSessionId(res.data.id);
    } catch (error) {
      console.error("Failed to create session:", error);
      alert("Failed to create session.");
    } finally {
      setLoading(false);
    }
  };

  // Active Chat Window
  if (selectedSessionId !== null) {
    return <Window />;
  }

  // Dataset creation form
  if (showForm) {
    return (
      <div className="flex-1 h-full flex items-center justify-center p-6 bg-zinc-950">
        <Form
          onSuccess={() => {
            setShowForm(false);
            refreshList();
          }}
          onCancel={() => {
            setShowForm(false);
          }}
        />
      </div>
    );
  }

  // Dataset creation wide action panel
  if (state === "data") {
    return (
      <div className="flex-1 h-full flex items-center justify-center p-6 bg-zinc-950">
        <div className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
            <Database className="w-7 h-7 text-indigo-400" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">
              No Dataset Selected
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Create a dataset to organize your document collection and start asking intelligent research questions.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-sm transition shadow-lg shadow-indigo-600/20"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Create New Dataset</span>
          </button>
        </div>
      </div>
    );
  }

  // Session creation wide action panel
  if (state === "session") {
    return (
      <div className="flex-1 h-full flex items-center justify-center p-6 bg-zinc-950">
        <div className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center">
            <MessageSquarePlus className="w-7 h-7 text-emerald-400" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">
              Select or Start a Chat Session
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Choose a session from the sidebar or launch a new conversation with multi-turn memory to query your dataset.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCreateSession}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-medium text-sm transition shadow-lg shadow-emerald-600/20 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <MessageSquarePlus className="w-5 h-5" />
            )}
            <span>{loading ? "Creating..." : "Create New Session"}</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
}
