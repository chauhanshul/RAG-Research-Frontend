"use client";

import List from "@/app/components/List";
import View from "@/app/components/View";
import Navbar from "@/app/components/Navbar";
import { AppProvider } from "@/app/context/AppContext";

export default function Home() {
  return (
    <AppProvider>
      <div className="h-screen w-screen flex flex-col overflow-hidden bg-zinc-950">
        <Navbar />
        <main className="flex-1 flex pt-16 h-[calc(100vh-4rem)] overflow-hidden">
          <List />
          <View />
        </main>
      </div>
    </AppProvider>
  );
}
