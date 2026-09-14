"use client";

import { useState } from "react";
import { Database, X, Loader2, Plus } from "lucide-react";
import api from "@/app/lib/api";
import { useApp } from "@/app/context/AppContext";

export default function Form({ onSuccess, onCancel }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { setState } = useApp();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    try {
      setLoading(true);
      await api.post("/datasets", { name: name.trim() });
      setName("");
      setState("data");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Failed to create dataset:", error);
      alert("Failed to create dataset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-400" />
          <h3 className="font-semibold text-zinc-100 text-base">
            Create Dataset
          </h3>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300">
            Dataset Name
          </label>
          <input
            type="text"
            placeholder="e.g. Machine Learning Research"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-100 text-sm placeholder:text-zinc-600 outline-none transition"
            autoFocus
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-xs transition disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span>{loading ? "Creating..." : "Create Dataset"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}