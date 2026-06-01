import GuestApp from "@/components/GuestApp";
import RoomDashboard from "@/components/RoomDashboard";
import SystemLogs from "@/components/SystemLogs";
import { SimulationProvider } from "@/context/SimulationContext";

export default function Home() {
  return (
    <SimulationProvider>
      <main style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', background: '#0a0b10' }}>
        
        {/* Layer 1: Full-Screen Interactive Floor Plan */}
        <RoomDashboard />

        {/* Layer 2: Floating Top-Right System Logs */}
        <SystemLogs />

        {/* Layer 3: Floating Bottom-Left Mobile App */}
        <GuestApp />

      </main>
    </SimulationProvider>
  );
}
