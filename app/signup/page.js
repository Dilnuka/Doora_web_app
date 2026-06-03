"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Lock, User, Mail, DoorClosed, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import ParticleNetwork from "@/components/ParticleNetwork";
import { motion, AnimatePresence } from "framer-motion";

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchRooms() {
      try {
        const res = await fetch("/api/rooms");
        if (res.ok) {
          const data = await res.json();
          setRooms(data.rooms || []);
        }
      } catch (err) {
        console.error("Failed to fetch rooms", err);
      } finally {
        setLoadingRooms(false);
      }
    }
    fetchRooms();
  }, []);

  const handleNext = (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill out all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!selectedRoomId) {
      setError("Please select an available room from the list.");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, selectedRoomId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Unable to create account.");
        setLoading(false);
        return;
      }

      const signInResult = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (signInResult?.error) {
        setError("Account created, but sign-in failed. Please log in.");
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError("Unexpected error while creating account.");
      setLoading(false);
    }
  };

  const slideVariants = {
    initial: (direction) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
      position: "absolute",
      width: "100%"
    }),
    animate: {
      x: 0,
      opacity: 1,
      position: "relative",
      transition: { duration: 0.4, ease: "easeOut" }
    },
    exit: (direction) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
      position: "absolute",
      transition: { duration: 0.3, ease: "easeIn" }
    })
  };

  return (
    <main className="auth-main" style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center", color: "white", fontFamily: "system-ui, sans-serif" }}>
      <ParticleNetwork />

      <div className="auth-card" style={{ position: "relative", zIndex: 10, width: step === 1 ? "460px" : "800px", transition: "width 0.4s ease-out", padding: "40px", background: "rgba(255,255,255,0.02)", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", display: "flex", flexDirection: "column", minHeight: "520px", maxHeight: "90vh" }}>
        
        <div style={{ textAlign: "center", marginBottom: "32px", flexShrink: 0 }}>
          <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: "0 0 8px 0", color: "#ffffff" }}>
            Create Your Doora Account
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>
            {step === 1 ? "Enter your details to get started" : "Select your room to complete registration"}
          </p>
        </div>

        {error && (
          <div style={{ flexShrink: 0, background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#ef4444", padding: "12px", borderRadius: "12px", marginBottom: "20px", fontSize: "14px", textAlign: "center" }}>
            {error}
          </div>
        )}

        <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <AnimatePresence custom={step === 1 ? -1 : 1} initial={false}>
            {step === 1 && (
              <motion.div
                key="step1"
                custom={-1}
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{ display: "flex", flexDirection: "column", gap: "20px", height: "100%" }}
              >
                <form onSubmit={handleNext} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }}>
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      style={{ width: "100%", padding: "16px 16px 16px 48px", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white", fontSize: "15px", outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" }}
                    />
                  </div>

                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }}>
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{ width: "100%", padding: "16px 16px 16px 48px", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white", fontSize: "15px", outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" }}
                    />
                  </div>

                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }}>
                      <Lock size={18} />
                    </div>
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{ width: "100%", padding: "16px 16px 16px 48px", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white", fontSize: "15px", outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{ width: "100%", padding: "16px", marginTop: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", background: "#2563eb", color: "white", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: "bold", cursor: "pointer", transition: "background-color 0.2s" }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#1d4ed8"}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#2563eb"}
                  >
                    Next: Select Room <ArrowRight size={18} />
                  </button>
                </form>

                <div style={{ textAlign: "center", marginTop: "auto", paddingTop: "20px", fontSize: "13px", color: "#94a3b8" }}>
                  Already have an account?{" "}
                  <Link href="/login" style={{ color: "#60a5fa", textDecoration: "none" }}>Log in</Link>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                custom={1}
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{ display: "flex", flexDirection: "column", gap: "20px", height: "100%", minHeight: 0 }}
              >
                <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: "rgba(0,0,0,0.3)", borderRadius: "16px", padding: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  {loadingRooms ? (
                    <div style={{ color: "#94a3b8", fontSize: "13px", textAlign: "center", padding: "40px 20px" }}>Loading rooms...</div>
                  ) : rooms.length === 0 ? (
                    <div style={{ color: "#ef4444", fontSize: "13px", textAlign: "center", padding: "40px 20px" }}>No rooms available.</div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px", flex: 1, overflowY: "auto", paddingRight: "4px" }}>
                      {rooms.map(room => (
                        <div 
                          key={room.id}
                          onClick={() => {
                            if (room.isAvailable) {
                              setSelectedRoomId(room.id);
                              setError("");
                            }
                          }}
                          style={{
                            background: selectedRoomId === room.id ? "rgba(59,130,246,0.2)" : room.isAvailable ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
                            border: selectedRoomId === room.id ? "1px solid #3b82f6" : "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "12px",
                            padding: "16px 12px",
                            cursor: room.isAvailable ? "pointer" : "not-allowed",
                            opacity: room.isAvailable ? 1 : 0.5,
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            transition: "all 0.2s"
                          }}
                        >
                          <DoorClosed size={20} color={selectedRoomId === room.id ? "#60a5fa" : room.isAvailable ? "#94a3b8" : "#475569"} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "14px", fontWeight: "bold", color: selectedRoomId === room.id ? "#fff" : room.isAvailable ? "#cbd5e1" : "#64748b" }}>{room.name}</div>
                            <div style={{ fontSize: "11px", marginTop: "2px", color: room.isAvailable ? "#94a3b8" : "#ef4444" }}>
                              {room.isAvailable ? "Available" : "Occupied"}
                            </div>
                          </div>
                          {selectedRoomId === room.id && <CheckCircle size={18} color="#3b82f6" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "12px", marginTop: "auto", paddingTop: "10px" }}>
                  <button
                    onClick={() => setStep(1)}
                    style={{ width: "120px", padding: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "rgba(255,255,255,0.05)", color: "white", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "15px", fontWeight: "bold", cursor: "pointer", transition: "all 0.2s" }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)" }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)" }}
                  >
                    <ArrowLeft size={18} /> Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !selectedRoomId}
                    style={{ flex: 1, padding: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: selectedRoomId ? "#10b981" : "rgba(16, 185, 129, 0.3)", color: "white", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: "bold", cursor: loading || !selectedRoomId ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, transition: "background-color 0.2s" }}
                    onMouseOver={(e) => { if(!loading && selectedRoomId) e.currentTarget.style.backgroundColor = "#059669" }}
                    onMouseOut={(e) => { if(!loading && selectedRoomId) e.currentTarget.style.backgroundColor = "#10b981" }}
                  >
                    {loading ? "Creating..." : "Complete Registration"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Branding Footer */}
      <motion.div
        className="branding-footer"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        style={{
          position: 'absolute',
          bottom: '24px',
          right: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 10,
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          padding: '8px 18px',
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          pointerEvents: 'auto'
        }}
      >
        <span style={{
          fontSize: '11px',
          fontWeight: '500',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          color: '#64748b'
        }}>
          Developed By
        </span>
        <a 
          href="https://vsis.lk" 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ 
            display: 'flex', 
            alignItems: 'center',
            textDecoration: 'none'
          }}
        >
          <motion.img
            src="/Vector-scaled-Photoroom.png"
            alt="VSIS Logo"
            style={{
              height: '18px',
              width: 'auto',
              display: 'block'
            }}
            whileHover={{ 
              scale: 1.05,
              filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.2)) brightness(1.1)'
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          />
        </a>
      </motion.div>
    </main>
  );
}
