"use client";
import React, { useState } from "react";
import { useSimulation } from "@/context/SimulationContext";
import { Bell, Terminal, Clock, ChevronDown, ChevronUp, User, LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

export default function SystemLogs() {
  const { serviceQueue, logs } = useSimulation();
  const [isOpen, setIsOpen] = useState(true);
  const { data: session } = useSession();
  const displayName = session?.user?.name || session?.user?.email || "Guest";
  const roomLabel = session?.user?.roomCode || "Private Suite";

  return (
    <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 50, width: '380px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Top bar: user info + logout + SYSTEM LOGS toggle — all in one row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end' }}>

        {/* User pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: 'rgba(26,29,41,0.85)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '40px',
          padding: '6px 16px 6px 6px',
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1e293b', border: '2px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <User size={16} color="white" />
          </div>
          <div>
            <p style={{ margin: 0, color: 'white', fontSize: '13px', fontWeight: '600', lineHeight: 1.2, whiteSpace: 'nowrap' }}>{displayName}</p>
            <p style={{ margin: 0, color: '#3b82f6', fontSize: '10px', letterSpacing: '1px', whiteSpace: 'nowrap' }}>{roomLabel}</p>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          title="Sign out"
          style={{
            width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
            background: 'rgba(26,29,41,0.85)',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s', backdropFilter: 'blur(12px)',
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(26,29,41,0.85)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
        >
          <LogOut size={16} color="#94a3b8" />
        </button>

        {/* SYSTEM LOGS toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="glass-card flex-center"
          style={{ padding: '8px 16px', gap: '8px', cursor: 'pointer', background: 'rgba(26,29,41,0.85)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', whiteSpace: 'nowrap' }}
        >
          <span style={{ fontSize: '12px', fontWeight: 'bold' }}>SYSTEM LOGS</span>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {/* Service Queue */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', maxHeight: '300px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={14} /> ALE Rainbow Queue
              </h3>
              <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                 <AnimatePresence>
                    {serviceQueue.length === 0 && (
                      <div style={{ color: 'var(--text-secondary)', fontSize: '12px', textAlign: 'center', marginTop: '10px' }}>No active requests</div>
                    )}
                    {serviceQueue.map(req => (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} 
                        key={req.id} 
                        className="glass-card" 
                        style={{ padding: '10px', borderLeft: '3px solid var(--accent-gold)' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                          <span style={{ fontWeight: '600', fontSize: '12px' }}>{req.type}</span>
                          <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}><Clock size={8} style={{display:'inline', marginRight:'4px'}}/>{req.time}</span>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{req.text}</div>
                      </motion.div>
                    ))}
                 </AnimatePresence>
              </div>
            </div>

            {/* System Logs */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', background: 'rgba(10,11,16,0.9)', maxHeight: '350px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={14} /> Backend Event Stream
              </h3>
              <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'monospace', fontSize: '11px' }}>
                 {logs.map(log => (
                   <div key={log.id} style={{ display: 'flex', gap: '8px', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                     <span style={{ color: 'var(--text-secondary)', minWidth: '65px' }}>{log.timestamp}</span>
                     <span style={{ 
                        color: log.source === 'client' ? '#60a5fa' : 
                               log.source === 'api' ? '#a78bfa' : 
                               log.source === 'iot' ? '#f472b6' : 
                               log.source === 'error' ? 'var(--danger)' : 'var(--text-primary)',
                        wordBreak: 'break-word'
                     }}>
                       {log.message}
                     </span>
                   </div>
                 ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
