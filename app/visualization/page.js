"use client";
import RoomDashboard from "@/components/RoomDashboard";
import SystemLogs from "@/components/SystemLogs";

export default function VisualizationPage() {
  return (
    <main className="vis-main" style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', background: '#0a0b10' }}>
      
      {/* Layer 1: Full-Screen Interactive Floor Plan */}
      <RoomDashboard />

      {/* Layer 2: Floating Top-Right System Logs */}
      <SystemLogs />

    </main>
  );
}
