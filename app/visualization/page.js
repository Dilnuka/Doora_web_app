"use client";
import { Suspense } from "react";
import RoomDashboard from "@/components/RoomDashboard";
import SystemLogs from "@/components/SystemLogs";

export default function VisualizationPage() {
  return (
    <main
      className="vis-main"
      style={{
        width: "100%",
        minHeight: "100dvh",
        maxHeight: "100dvh",
        overflow: "hidden",
        position: "relative",
        background: "#0a0b10",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Suspense
        fallback={
          <div
            style={{
              display: "flex",
              width: "100%",
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              color: "#8b5cf6",
              fontFamily: "system-ui, sans-serif",
              fontSize: "18px",
              fontWeight: "bold",
              background: "#050508",
            }}
          >
            Loading Command Center...
          </div>
        }
      >
        <RoomDashboard />
        <SystemLogs />
      </Suspense>
    </main>
  );
}
