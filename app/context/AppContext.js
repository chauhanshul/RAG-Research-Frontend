"use client";

import { createContext, useContext, useEffect, useState } from "react";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [state, setState] = useState("");
  const [selectedDatasetId, setSelectedDatasetId] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  // Bumping this triggers any list-fetching effect that watches it
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Restore state after refresh
  useEffect(() => {
    const savedState = localStorage.getItem("state");
    const savedDatasetId = localStorage.getItem("selectedDatasetId");
    const savedSessionId = localStorage.getItem("selectedSessionId");

    if (savedState) {
      setState(savedState);
    }

    if (savedDatasetId) {
      setSelectedDatasetId(savedDatasetId);
    }

    if (savedSessionId) {
      setSelectedSessionId(savedSessionId);
    }
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    localStorage.setItem("state", state);
  }, [state]);

  useEffect(() => {
    if (selectedDatasetId !== null) {
      localStorage.setItem("selectedDatasetId", selectedDatasetId);
    } else {
      localStorage.removeItem("selectedDatasetId");
    }
  }, [selectedDatasetId]);

  useEffect(() => {
    if (selectedSessionId !== null) {
      localStorage.setItem("selectedSessionId", selectedSessionId);
    } else {
      localStorage.removeItem("selectedSessionId");
    }
  }, [selectedSessionId]);

  const goBack = () => {
    if (selectedSessionId !== null) {
      setSelectedSessionId(null);
      return;
    }

    if (selectedDatasetId !== null) {
      setSelectedDatasetId(null);
      setState("data");
    }
  };

  // Call this after creating/deleting a dataset or session to trigger a re-fetch
  const refreshList = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <AppContext.Provider
      value={{
        state,
        setState,
        selectedDatasetId,
        setSelectedDatasetId,
        selectedSessionId,
        setSelectedSessionId,
        goBack,
        refreshList,
        refreshTrigger,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}