"use client";
import GuestApp from "@/components/GuestApp";
import { SimulationProvider } from "@/context/SimulationContext";

export default function ControllerPage() {
  return (
    <SimulationProvider>
      <main style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#0a0b10', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <GuestApp />
      </main>
    </SimulationProvider>
  );
}
