"use client";
import AdminGroundMap from "@/components/AdminGroundMap";

export default function AdminPage() {
  return (
    <main style={{ width: '100vw', minHeight: '100vh', overflowY: 'auto', overflowX: 'hidden', background: '#050508' }}>
      <AdminGroundMap />
    </main>
  );
}
