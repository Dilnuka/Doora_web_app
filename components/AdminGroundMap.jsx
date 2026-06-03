"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, Thermometer, Lock, Unlock, Lightbulb, Tv, Map, ArrowRight, ArrowLeft, X, ShieldAlert, DoorClosed, Wind } from "lucide-react";
import ParticleNetwork from "@/components/ParticleNetwork";

export default function AdminGroundMap() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchRooms();
    // Poll for real-time updates every 5 seconds
    const interval = setInterval(fetchRooms, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await fetch("/api/admin/rooms");
      if (!res.ok) {
        if (res.status === 403) throw new Error("Unauthorized. Admin access required.");
        throw new Error("Failed to fetch rooms.");
      }
      const data = await res.json();
      // Exclude system rooms - show all real guest rooms including dynamic ones
      const hotelRooms = data.rooms.filter(
        r => r.code !== 'ADMIN-ROOM' && r.code !== 'GUEST-ROOM'
      );
      setRooms(hotelRooms);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
  };

  const closeOverlay = () => {
    setSelectedRoom(null);
  };

  const goToBlueprint = (room) => {
    router.push(`/visualization?roomId=${room.id}&roomCode=${room.code}`);
  };

  return (
    <div style={{ position: "relative", width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center" }}>
      
      {/* Background Particle Effects - fixed so it covers full viewport while scrolling */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <ParticleNetwork />
      </div>

      {/* ── Back Button (fixed top-left) ─────────────── */}
      <Link href="/" style={{ textDecoration: "none" }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          whileHover={{ scale: 1.05, x: -2 }}
          whileTap={{ scale: 0.97 }}
          style={{
            position: "fixed",
            top: "24px",
            left: "24px",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "rgba(10, 12, 20, 0.75)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "14px",
            padding: "10px 18px",
            cursor: "pointer",
            boxShadow: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "28px",
            height: "28px",
            borderRadius: "8px",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.1)",
            flexShrink: 0,
          }}>
            <ArrowLeft size={14} color="#94a3b8" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#e2e8f0", letterSpacing: "0.3px" }}>Back to Home</span>
            <span style={{ fontSize: "10px", color: "#475569", letterSpacing: "0.5px" }}>DOORA Enterprise</span>
          </div>
        </motion.div>
      </Link>

      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: "1200px", padding: "40px 40px 80px 40px" }}>
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "40px" }}
        >
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: "bold", margin: "0 0 8px 0", display: "flex", alignItems: "center", gap: "12px", color: "white" }}>
              <Map size={32} color="#3b82f6" /> 
              Hotel Ground Map
            </h1>
            <p style={{ color: "#94a3b8", margin: 0, fontSize: "16px" }}>
              Live Monitoring & Control for all {rooms.length} Guest Rooms
            </p>
          </div>
          
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.05)", padding: "8px 16px", borderRadius: "20px" }}>
              <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 10px #22c55e" }} />
              <span style={{ fontSize: "12px", color: "#e2e8f0" }}>Available</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.05)", padding: "8px 16px", borderRadius: "20px" }}>
              <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#3b82f6", boxShadow: "0 0 10px #3b82f6" }} />
              <span style={{ fontSize: "12px", color: "#e2e8f0" }}>Occupied</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.05)", padding: "8px 16px", borderRadius: "20px" }}>
              <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 10px #ef4444" }} />
              <span style={{ fontSize: "12px", color: "#e2e8f0" }}>Alert</span>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "100px", color: "#3b82f6" }}>Loading Map...</div>
        ) : error ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "100px", color: "#ef4444" }}>{error}</div>
        ) : (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", 
            gap: "20px",
            background: "rgba(0,0,0,0.3)",
            padding: "40px",
            borderRadius: "30px",
            border: "1px solid rgba(255,255,255,0.05)",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5), inset 0 0 40px rgba(255,255,255,0.02)",
            backdropFilter: "blur(20px)"
          }}>
            {rooms.map((room, idx) => {
              const state = room.state || {};
              // True occupancy = a guest is assigned to this room in the database
              const isOccupied = room.hasGuest;
              const hasAlert = state.smokeDetected || state.doorLocked === false;
              
              let statusColor = "#22c55e"; // Default Green (Free/Available)
              let glowColor = "rgba(34, 197, 94, 0.2)";
              
              if (hasAlert) {
                statusColor = "#ef4444";
                glowColor = "rgba(239, 68, 68, 0.3)";
              } else if (isOccupied) {
                statusColor = "#3b82f6";
                glowColor = "rgba(59, 130, 246, 0.3)";
              }

              return (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => handleRoomClick(room)}
                  whileHover={{ scale: 1.05, borderColor: statusColor, boxShadow: `0 10px 30px ${glowColor}` }}
                  style={{
                    cursor: "pointer",
                    background: "rgba(20, 22, 28, 0.8)",
                    border: "2px solid rgba(255,255,255,0.08)",
                    borderRadius: "16px",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    position: "relative",
                    overflow: "hidden",
                    transition: "all 0.3s"
                  }}
                >
                  {/* Status Indicator Bar (Top) */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: statusColor, boxShadow: `0 0 10px ${statusColor}` }} />

                  {hasAlert && (
                    <motion.div
                      animate={{ opacity: [0.2, 0.8, 0.2] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      style={{ position: "absolute", top: 12, right: 12, color: "#ef4444" }}
                    >
                      <ShieldAlert size={18} />
                    </motion.div>
                  )}

                  <DoorClosed size={40} color={isOccupied ? "#3b82f6" : "#64748b"} style={{ marginBottom: "12px", filter: isOccupied ? "drop-shadow(0 0 10px rgba(59,130,246,0.5))" : "none" }} />
                  
                  <h3 style={{ margin: "0 0 2px 0", fontSize: "16px", fontWeight: "bold", color: "white" }}>{room.name}</h3>
                  <span style={{ fontSize: "10px", color: "#94a3b8", letterSpacing: "1px", textTransform: "uppercase" }}>{room.code}</span>

                  {/* Guest badge */}
                  {isOccupied && room.guestName && (
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "6px", background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)", padding: "2px 8px", borderRadius: "20px" }}>
                      <Users size={10} color="#60a5fa" />
                      <span style={{ fontSize: "10px", color: "#60a5fa", fontWeight: "600", maxWidth: "80px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{room.guestName}</span>
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "12px", padding: "8px 12px", background: "rgba(0,0,0,0.4)", borderRadius: "12px", width: "100%", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", color: state.ambientTemp > 26 ? "#f87171" : "#38bdf8" }}>
                      <Thermometer size={14} />
                      <span style={{ fontSize: "12px", fontWeight: "600" }}>{state.ambientTemp || 24.5}°C</span>
                    </div>
                    <div style={{ color: state.doorLocked === false ? "#ef4444" : "#22c55e" }}>
                      {state.doorLocked === false ? <Unlock size={14} /> : <Lock size={14} />}
                    </div>
                  </div>

                  {/* View Blueprint Button on card */}
                  <motion.button
                    onClick={(e) => { e.stopPropagation(); goToBlueprint(room); }}
                    whileHover={{ scale: 1.03, backgroundColor: "rgba(59,130,246,0.25)" }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      marginTop: "10px",
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      background: "rgba(59,130,246,0.12)",
                      border: "1px solid rgba(59,130,246,0.3)",
                      borderRadius: "10px",
                      padding: "7px 10px",
                      color: "#60a5fa",
                      fontSize: "11px",
                      fontWeight: "700",
                      cursor: "pointer",
                      letterSpacing: "0.5px",
                      transition: "all 0.2s",
                    }}
                  >
                    <Map size={12} /> View Blueprint
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Stats Overlay Modal */}
      <AnimatePresence>
        {selectedRoom && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeOverlay}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 100 }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-40%" }}
              animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
              exit={{ opacity: 0, scale: 0.9, x: "-50%", y: "-40%" }}
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                width: "480px",
                maxWidth: "90vw",
                maxHeight: "90vh",
                display: "flex",
                flexDirection: "column",
                background: "#0f111a",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "24px",
                boxShadow: "0 30px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
                zIndex: 101,
                overflow: "hidden"
              }}
            >
              {/* Modal Header */}
              <div style={{ padding: "24px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.02)" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "22px", color: "white", display: "flex", alignItems: "center", gap: "10px" }}>
                    <DoorClosed color="#3b82f6" /> {selectedRoom.name}
                  </h2>
                  <span style={{ fontSize: "12px", color: "#94a3b8", letterSpacing: "1px" }}>{selectedRoom.code} • QUICK STATS</span>
                </div>
                <button onClick={closeOverlay} style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer" }}>
                  <X size={24} />
                </button>
              </div>

              {/* Stats Content */}
              <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px", overflowY: "auto", flex: 1 }}>
                
                {/* Main Statuses */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={{ background: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Users size={14} /> Occupancy
                    </div>
                    <div style={{ fontSize: "16px", fontWeight: "bold", color: selectedRoom.hasGuest ? "#3b82f6" : "#64748b" }}>
                      {selectedRoom.hasGuest
                        ? `Checked In${selectedRoom.guestName ? ` — ${selectedRoom.guestName}` : ""}`
                        : "Available"}
                    </div>
                  </div>
                  
                  <div style={{ background: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Lock size={14} /> Security
                    </div>
                    <div style={{ fontSize: "16px", fontWeight: "bold", color: selectedRoom.state?.doorLocked !== false ? "#22c55e" : "#ef4444" }}>
                      {selectedRoom.state?.doorLocked !== false ? "Secured" : "Door Unlocked"}
                    </div>
                  </div>
                </div>

                {/* Sub-systems */}
                <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: "16px", padding: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <h4 style={{ margin: "0 0 16px 0", fontSize: "12px", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px" }}>Sub-systems</h4>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#cbd5e1" }}><Wind size={16} /> HVAC / AC</span>
                      <span style={{ fontSize: "14px", fontWeight: "bold", color: selectedRoom.state?.ac?.isOn ? "#3b82f6" : "#64748b" }}>
                        {selectedRoom.state?.ac?.isOn ? `ON (${selectedRoom.state?.ac?.temp}°C)` : "OFF"}
                      </span>
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#cbd5e1" }}><Lightbulb size={16} /> Lighting</span>
                      <span style={{ fontSize: "14px", fontWeight: "bold", color: selectedRoom.state?.lights?.master ? "#eab308" : "#64748b" }}>
                        {selectedRoom.state?.lights?.master ? "ACTIVE" : "OFF"}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#cbd5e1" }}><Tv size={16} /> Smart TV</span>
                      <span style={{ fontSize: "14px", fontWeight: "bold", color: selectedRoom.state?.tv ? "#3b82f6" : "#64748b" }}>
                        {selectedRoom.state?.tv ? "ON" : "OFF"}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Footer */}
              <div style={{ padding: "20px 24px", background: "rgba(59,130,246,0.04)", borderTop: "1px solid rgba(59,130,246,0.15)", display: "flex", flexDirection: "column", gap: "10px" }}>
                {/* Primary: View Blueprint */}
                <motion.button
                  onClick={() => goToBlueprint(selectedRoom)}
                  whileHover={{ scale: 1.02, boxShadow: "0 8px 24px rgba(59,130,246,0.5)" }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    color: "white",
                    padding: "14px 24px",
                    borderRadius: "14px",
                    border: "none",
                    fontSize: "14px",
                    fontWeight: "700",
                    cursor: "pointer",
                    letterSpacing: "0.3px",
                    boxShadow: "0 4px 16px rgba(59,130,246,0.35)",
                  }}
                >
                  <Map size={16} />
                  Open Room Blueprint
                  <ArrowRight size={16} />
                </motion.button>
                {/* Secondary: close */}
                <button
                  onClick={closeOverlay}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    padding: "10px",
                    color: "#64748b",
                    fontSize: "13px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = "#94a3b8"}
                  onMouseOut={(e) => e.currentTarget.style.color = "#64748b"}
                >
                  Close
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
