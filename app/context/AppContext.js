"use client";

import { createContext, useContext, useEffect, useState } from "react";

const AppContext = createContext();

export function AppProvider({ children }) {
  // Default to "data" so the dataset list can load.
  const [state, setState] = useState("data");

  const [selectedDatasetId, setSelectedDatasetId] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  // Used to trigger list refreshes after creating/deleting items.
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Prevent components from fetching/rendering based on the
  // temporary default state before localStorage is restored.
  const [isRestoring, setIsRestoring] = useState(true);

  // Restore state after a page refresh.
  useEffect(() => {
    const savedState = localStorage.getItem("state");
    const savedDatasetId =
      localStorage.getItem("selectedDatasetId");
    const savedSessionId =
      localStorage.getItem("selectedSessionId");

    if (savedState) {
      setState(savedState);
    }

    if (savedDatasetId) {
      setSelectedDatasetId(savedDatasetId);
    }

    if (savedSessionId) {
      setSelectedSessionId(savedSessionId);
    }

    // Restoration is complete.
    setIsRestoring(false);
  }, []);

  // Save state whenever it changes.
  useEffect(() => {
    if (isRestoring) {
      return;
    }

    localStorage.setItem("state", state);
  }, [state, isRestoring]);

  // Save selected dataset whenever it changes.
  useEffect(() => {
    if (isRestoring) {
      return;
    }

    if (selectedDatasetId !== null) {
      localStorage.setItem(
        "selectedDatasetId",
        selectedDatasetId
      );
    } else {
      localStorage.removeItem("selectedDatasetId");
    }
  }, [selectedDatasetId, isRestoring]);

  // Save selected session whenever it changes.
  useEffect(() => {
    if (isRestoring) {
      return;
    }

    if (selectedSessionId !== null) {
      localStorage.setItem(
        "selectedSessionId",
        selectedSessionId
      );
    } else {
      localStorage.removeItem("selectedSessionId");
    }
  }, [selectedSessionId, isRestoring]);

  // Navigate backwards:
  // session -> dataset list -> nothing
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

  // Trigger a re-fetch of datasets/sessions.
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

        isRestoring,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}