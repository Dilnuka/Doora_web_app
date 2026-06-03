"use client";
import { Suspense } from "react";
import RoomDashboard from "@/components/RoomDashboard";
import SystemLogs from "@/components/SystemLogs";

export default function VisualizationPage() {
  return (
    <main className="vis-main" style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', background: '#0a0b10' }}>
      <Suspense fallback={
        <div style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#8b5cf6',
          fontFamily: 'system-ui, sans-serif',
          fontSize: '18px',
          fontWeight: 'bold',
          background: '#050508'
        }}>
          Loading Command Center...
        </div>
      }>
        {/* Layer 1: Full-Screen Interactive Floor Plan */}
        <RoomDashboard />

        {/* Layer 2: Floating Top-Right System Logs */}
        <SystemLogs />
      </Suspense>
    </main>
  );
}
