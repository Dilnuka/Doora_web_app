"use client";
import React from "react";
import { useSimulation } from "@/context/SimulationContext";
import { Terminal, Lock, Unlock, Tv, Blinds, Lightbulb, Thermometer, UserCheck, Coffee, ShieldAlert, Wind, AlarmClock, User, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

export default function RoomDashboard() {
   const { roomState } = useSimulation();

   const isAnyLightOn = roomState.lights.master || roomState.lights.bath || roomState.lights.bed || roomState.lights.living || roomState.lights.kitchen;

   return (
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>

         {/* Fire Alarm Overlay Effect */}
         <AnimatePresence>
            {roomState.smokeDetected && (
               <motion.div
                  animate={{ opacity: [0, 0.15, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  style={{ position: 'absolute', inset: 0, background: '#ef4444', zIndex: 1 }}
               />
            )}
         </AnimatePresence>

         {/* Alarm Ringing Overlay Effect */}
         <AnimatePresence>
            {roomState.alarm?.ringing && (
               <motion.div
                  animate={{ opacity: [0, 0.12, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  style={{ position: 'absolute', inset: 0, background: '#f97316', zIndex: 1 }}
               />
            )}
         </AnimatePresence>

         {/* Header (Floating) */}
         <div style={{ position: 'absolute', top: '32px', left: '32px', zIndex: 10 }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '12px', color: 'white', textShadow: '0 4px 15px rgba(0,0,0,1)', margin: 0 }}>
               <Terminal size={28} color="var(--accent-purple)" /> DOORA Command Center
            </h2>
            <p style={{ margin: '8px 0 0 40px', color: 'var(--text-secondary)', fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase' }}>Suite 204 Blueprint</p>
         </div>

         {/* Top-Down Room Visualization */}
         <div style={{
            position: 'absolute',
            inset: 0,
            background: isAnyLightOn ? '#1a1b24' : '#11121a',
            transition: 'background 0.5s ease',
            zIndex: 2
         }}>

            {/* Grid Floor Pattern */}
            <div style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

            {/* --- ROOM CONTAINER (Holds Walls, Furniture, and Devices) --- */}
            <div style={{ position: 'absolute', top: '15%', bottom: '15%', left: '15%', right: '15%' }}>

               {/* Outer Walls */}
               <div style={{ position: 'absolute', inset: 0, border: '6px solid #333', borderRadius: '16px', pointerEvents: 'none', zIndex: 10 }} />

               {/* ========================================================
                   ARCHITECTURAL FURNITURE & INTERIOR WALLS
                   ======================================================== */}

               {/* ----------------- RIGHT WING: BEDROOM & BATHROOM ----------------- */}

               {/* Interior Wall Separating Right Wing from Living Room */}
               <div style={{ position: 'absolute', top: 0, right: '35%', width: '6px', height: '65%', background: '#333', zIndex: 10, borderBottomLeftRadius: '4px', borderBottomRightRadius: '4px' }} />
               <div style={{ position: 'absolute', bottom: 0, right: '35%', width: '6px', height: '15%', background: '#333', zIndex: 10, borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }} />

               {/* Partition Curtains between Bedroom & Living Room */}
               <div style={{ position: 'absolute', top: '65%', right: '35%', width: '6px', height: '20%', display: 'flex', flexDirection: 'column', zIndex: 11 }}>
                  <motion.div
                     animate={{ height: roomState.curtains?.living ? '15%' : '50%' }}
                     transition={{ duration: 1.5, ease: 'easeInOut' }}
                     style={{ width: '100%', background: '#10b981', borderRadius: '4px', boxShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
                  />
                  <div style={{ flex: 1 }} />
                  <motion.div
                     animate={{ height: roomState.curtains?.living ? '15%' : '50%' }}
                     transition={{ duration: 1.5, ease: 'easeInOut' }}
                     style={{ width: '100%', background: '#10b981', borderRadius: '4px', boxShadow: '0 -2px 10px rgba(0,0,0,0.5)' }}
                  />
               </div>

               {/* Interior Wall Separating Bath and Bedroom */}
               <div style={{ position: 'absolute', top: '45%', right: 0, width: '25%', height: '6px', background: '#333', zIndex: 10, borderTopLeftRadius: '4px', borderBottomLeftRadius: '4px' }} />
               <div style={{ position: 'absolute', top: '45%', right: '30%', width: '5%', height: '6px', background: '#333', zIndex: 10, borderTopRightRadius: '4px', borderBottomRightRadius: '4px' }} />
               {/* En-suite doorway from Bedroom to Bath is between 25% and 30% from the right */}

               {/* 1. Bathroom (Top Right En-suite) */}
               <div style={{ position: 'absolute', top: 0, right: 0, width: '35%', height: '45%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.015)' }}>
                  <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: '2vw', fontWeight: 'bold', letterSpacing: '4px', transform: 'rotate(-45deg)', zIndex: 1 }}>BATH</span>
                  {/* Shower Cubicle */}
                  <div style={{ position: 'absolute', top: '5%', right: '5%', width: '35%', height: '55%', border: '2px solid rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                     <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '12px', height: '12px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)' }} />
                  </div>
                  {/* Vanity/Sink */}
                  <div style={{ position: 'absolute', bottom: '15%', left: 0, width: '25%', height: '40%', borderRight: '2px solid rgba(255,255,255,0.05)', borderTop: '2px solid rgba(255,255,255,0.05)', borderTopRightRadius: '16px' }}>
                     <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '60%', height: '40%', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%' }} />
                  </div>
               </div>

               {/* 2. King Bed (Bottom Right Bedroom) */}
               <div style={{ position: 'absolute', bottom: '15%', right: '2%', width: '25%', height: '30%', borderTop: '2px solid rgba(255,255,255,0.1)', borderBottom: '2px solid rgba(255,255,255,0.1)', borderLeft: '2px solid rgba(255,255,255,0.1)', borderTopLeftRadius: '16px', borderBottomLeftRadius: '16px', background: 'rgba(255,255,255,0.02)', display: 'flex', padding: '2% 4% 2% 2%' }}>
                  {/* Pillows */}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '20%', height: '100%' }}>
                     <div style={{ height: '45%', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />
                     <div style={{ height: '45%', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />
                  </div>
                  {/* Blanket */}
                  <div style={{ flex: 1, marginLeft: '5%', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: '12px', letterSpacing: '2px', transform: 'rotate(-90deg)' }}>KING BED</span>
                  </div>
               </div>

               {/* Bedroom Floor Text */}
               <div style={{ position: 'absolute', bottom: '2%', right: '10%' }}>
                  <span style={{ color: 'rgba(255,255,255,0.05)', fontSize: '24px', fontWeight: 'bold', letterSpacing: '8px' }}>BEDROOM</span>
               </div>

               {/* Nightstands (Inside Bedroom) */}
               <div style={{ position: 'absolute', bottom: '48%', right: 0, width: '6%', height: '6%', borderTop: '2px solid rgba(255,255,255,0.1)', borderBottom: '2px solid rgba(255,255,255,0.1)', borderLeft: '2px solid rgba(255,255,255,0.1)', borderTopLeftRadius: '4px', borderBottomLeftRadius: '4px', background: 'rgba(255,255,255,0.02)' }} />
               <div style={{ position: 'absolute', bottom: '6%', right: 0, width: '6%', height: '6%', borderTop: '2px solid rgba(255,255,255,0.1)', borderBottom: '2px solid rgba(255,255,255,0.1)', borderLeft: '2px solid rgba(255,255,255,0.1)', borderTopLeftRadius: '4px', borderBottomLeftRadius: '4px', background: 'rgba(255,255,255,0.02)' }} />

               {/* Alarm Clock (on Lower Nightstand) */}
               <div style={{ position: 'absolute', bottom: '6.5%', right: '0.5%', zIndex: 20 }}>
                  <div style={{
                     width: '26px', height: '26px', borderRadius: '50%',
                     background: roomState.alarm?.ringing ? 'rgba(249,115,22,0.3)' : roomState.alarm?.enabled ? 'rgba(249,115,22,0.15)' : '#111',
                     border: `2px solid ${roomState.alarm?.ringing ? '#f97316' : roomState.alarm?.enabled ? 'rgba(249,115,22,0.6)' : '#333'}`,
                     display: 'flex', alignItems: 'center', justifyContent: 'center',
                     boxShadow: roomState.alarm?.enabled ? '0 0 10px rgba(249,115,22,0.4)' : 'none',
                     transition: 'all 0.3s'
                  }}>
                     <AlarmClock size={13} color={roomState.alarm?.ringing ? '#f97316' : roomState.alarm?.enabled ? '#fb923c' : '#555'} />
                  </div>
                  {/* Ringing pulse ring */}
                  <AnimatePresence>
                     {roomState.alarm?.ringing && (
                        <motion.div
                           animate={{ scale: [1, 4], opacity: [1, 0] }}
                           transition={{ duration: 1, repeat: Infinity }}
                           style={{ position: 'absolute', top: '-3px', left: '-3px', width: '32px', height: '32px', border: '3px solid #f97316', borderRadius: '50%' }}
                        />
                     )}
                  </AnimatePresence>
               </div>

               {/* Smart Window & Curtains (Far Right Wall, Bedroom) */}
               <div style={{ position: 'absolute', top: '55%', right: '-6px', width: '24px', height: '30%', background: '#111', overflow: 'hidden', borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px', borderTop: '3px solid #333', borderBottom: '3px solid #333', borderLeft: '3px solid #333', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 15 }}>
                  <span style={{ zIndex: 5, color: '#666', fontSize: '9px', fontWeight: 'bold', letterSpacing: '1px', transform: 'rotate(90deg)' }}>WINDOW</span>

                  {/* Window Contact Sensor */}
                  <div style={{ position: 'absolute', top: '50%', left: '4px', transform: 'translateY(-50%)', zIndex: 20 }}>
                     <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: roomState.windowOpen?.bed ? '#ef4444' : '#22c55e', boxShadow: `0 0 8px ${roomState.windowOpen?.bed ? '#ef4444' : '#22c55e'}` }} />
                  </div>

                  {/* Sunlight/Outside Glow when open */}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(270deg, #38bdf8, transparent)', opacity: roomState.curtains?.bed ? 1 : 0, transition: 'opacity 1s ease' }} />

                  {/* Top Curtain */}
                  <motion.div
                     animate={{ height: roomState.curtains?.bed ? '15%' : '50%' }}
                     transition={{ duration: 1.5, ease: 'easeInOut' }}
                     style={{ position: 'absolute', top: 0, left: 0, right: 0, background: '#10b981', boxShadow: '0 2px 10px rgba(0,0,0,0.5)', borderBottom: '2px solid #059669' }}
                  />
                  {/* Bottom Curtain */}
                  <motion.div
                     animate={{ height: roomState.curtains?.bed ? '15%' : '50%' }}
                     transition={{ duration: 1.5, ease: 'easeInOut' }}
                     style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#10b981', boxShadow: '0 -2px 10px rgba(0,0,0,0.5)', borderTop: '2px solid #059669' }}
                  />
               </div>
               {/* Sun rays casting onto the bedroom floor */}
               <motion.div
                  animate={{ opacity: roomState.curtains?.bed ? 0.2 : 0 }}
                  transition={{ duration: 1.5 }}
                  style={{ position: 'absolute', top: '55%', right: '18px', width: '150px', height: '30%', background: 'linear-gradient(270deg, rgba(56,189,248,0.5), transparent)', pointerEvents: 'none', zIndex: 1 }}
               />

               {/* ----------------- LEFT WING: ENTRANCE & KITCHEN ----------------- */}

               {/* 3. Kitchen (Top Left) */}
               <div style={{ position: 'absolute', top: 0, left: 0, width: '30%', height: '40%', background: 'rgba(255,255,255,0.01)' }}>
                  <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: '2vw', fontWeight: 'bold', letterSpacing: '4px', zIndex: 1, position: 'absolute', top: '35%', left: '50%', transform: 'translateX(-50%)' }}>KITCHEN</span>

                  {/* Top Counter */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '25%', background: 'rgba(255,255,255,0.03)', borderBottom: '2px solid rgba(255,255,255,0.1)', borderBottomRightRadius: '8px' }} />
                  {/* Left Counter */}
                  <div style={{ position: 'absolute', top: '25%', left: 0, width: '25%', bottom: 0, background: 'rgba(255,255,255,0.03)', borderRight: '2px solid rgba(255,255,255,0.1)', borderBottomRightRadius: '8px' }} />

                  {/* Kitchen Sink (On Top Counter) */}
                  <div style={{ position: 'absolute', top: '5%', left: '50%', width: '30%', height: '15%', border: '2px solid rgba(255,255,255,0.2)', borderRadius: '4px' }}>
                     <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }} />
                  </div>

                  {/* Kitchen Island */}
                  <div style={{ position: 'absolute', top: '60%', left: '40%', width: '40%', height: '20%', border: '2px solid rgba(255,255,255,0.15)', borderRadius: '4px', background: 'rgba(255,255,255,0.02)' }} />

                  {/* IoT Coffee Maker (On Left Counter) */}
                  <div style={{ position: 'absolute', top: '40%', left: '12%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                     {roomState.coffeeMaker && (
                        <motion.div
                           initial={{ opacity: 0, y: 10 }} animate={{ opacity: [0, 0.6, 0], y: -20 }} transition={{ duration: 1.5, repeat: Infinity }}
                           style={{ width: '10px', height: '10px', background: 'rgba(255,255,255,0.6)', borderRadius: '50%', filter: 'blur(4px)', position: 'absolute', top: '-15px' }}
                        />
                     )}
                     <Coffee size={20} color={roomState.coffeeMaker ? '#8b5cf6' : 'rgba(255,255,255,0.3)'} style={{ filter: roomState.coffeeMaker ? 'drop-shadow(0 0 5px #8b5cf6)' : 'none' }} />
                  </div>
               </div>

               {/* 4. Entrance Hallway & Closet (Bottom Left) */}
               <div style={{ position: 'absolute', bottom: '5%', left: 0, width: '14%', height: '22%', borderRight: '2px solid rgba(255,255,255,0.15)', borderTop: '2px solid rgba(255,255,255,0.15)', borderTopRightRadius: '8px', background: 'repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(255,255,255,0.025) 6px, rgba(255,255,255,0.025) 12px)' }}>
                  {/* Sliding door arc */}
                  <div style={{ position: 'absolute', top: 0, right: '-1px', width: '40%', height: '40%', borderBottom: '1px dashed rgba(255,255,255,0.12)', borderBottomRightRadius: '100%', borderRight: '1px dashed rgba(255,255,255,0.12)' }} />
                  <span style={{ position: 'absolute', bottom: '18%', left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.25)', fontSize: '9px', letterSpacing: '2px', whiteSpace: 'nowrap' }}>CLOSET</span>
               </div>


               {/* ----------------- CENTER: LIVING AREA ----------------- */}

               {/* 5. Living Area Rug (Center) */}
               <div style={{ position: 'absolute', bottom: '10%', left: '30%', right: '45%', height: '50%', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '8px', background: 'rgba(255,255,255,0.01)' }} />
               <div style={{ position: 'absolute', bottom: '2%', left: '42%' }}>
                  <span style={{ color: 'rgba(255,255,255,0.05)', fontSize: '24px', fontWeight: 'bold', letterSpacing: '8px' }}>LIVING</span>
               </div>

               {/* 6. Sofa (Left side of Living Room, facing Right TV) */}
               <div style={{ position: 'absolute', bottom: '20%', left: '35%', width: '8%', height: '30%', border: '2px solid rgba(255,255,255,0.15)', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px', letterSpacing: '2px', transform: 'rotate(-90deg)' }}>SOFA</span>
               </div>

               {/* 7. Coffee Table (Center of Living Room) */}
               <div style={{ position: 'absolute', bottom: '28%', left: '46%', width: '6%', height: '15%', border: '2px solid rgba(255,255,255,0.1)', borderRadius: '50%', background: 'rgba(255,255,255,0.02)' }} />

               {/* 8. Desk/Workspace (Top Center, near Window) */}
               <div style={{ position: 'absolute', top: '2%', left: '45%', width: '15%', height: '8%', borderRight: '2px solid rgba(255,255,255,0.1)', borderBottom: '2px solid rgba(255,255,255,0.1)', borderLeft: '2px solid rgba(255,255,255,0.1)', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px', letterSpacing: '2px' }}>DESK</span>
                  {/* Desk Chair */}
                  <div style={{ position: 'absolute', bottom: '-80%', left: '50%', transform: 'translateX(-50%)', width: '30%', height: '60%', border: '2px solid rgba(255,255,255,0.1)', borderRadius: '50%' }} />
               </div>


               {/* ========================================================
                   FUNCTIONAL SMART DEVICES (Tied to state)
                   ======================================================== */}

               {/* --- MULTI-ZONE LIGHTING --- */}

               {/* Kitchen Light */}
               <div style={{ position: 'absolute', top: '20%', left: '15%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 4 }}>
                  <motion.div animate={{ scale: roomState.lights.kitchen || roomState.lights.master ? 1 : 0.2, opacity: roomState.lights.kitchen || roomState.lights.master ? 1 : 0 }} transition={{ duration: 0.5 }}
                     style={{ width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(212,175,55,0.25) 0%, transparent 60%)', borderRadius: '50%' }} />
               </div>

               {/* Bath Light */}
               <div style={{ position: 'absolute', top: '20%', right: '15%', transform: 'translate(50%, -50%)', pointerEvents: 'none', zIndex: 4 }}>
                  <motion.div animate={{ scale: roomState.lights.bath || roomState.lights.master ? 1 : 0.2, opacity: roomState.lights.bath || roomState.lights.master ? 1 : 0 }} transition={{ duration: 0.5 }}
                     style={{ width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(212,175,55,0.3) 0%, transparent 60%)', borderRadius: '50%' }} />
               </div>

               {/* Bed Light */}
               <div style={{ position: 'absolute', bottom: '25%', right: '15%', transform: 'translate(50%, 50%)', pointerEvents: 'none', zIndex: 4 }}>
                  <motion.div animate={{ scale: roomState.lights.bed || roomState.lights.master ? 1 : 0.2, opacity: roomState.lights.bed || roomState.lights.master ? 1 : 0 }} transition={{ duration: 0.5 }}
                     style={{ width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(212,175,55,0.25) 0%, transparent 60%)', borderRadius: '50%' }} />
               </div>

               {/* Living Light */}
               <div style={{ position: 'absolute', bottom: '30%', left: '45%', transform: 'translate(-50%, 50%)', pointerEvents: 'none', zIndex: 4 }}>
                  <motion.div animate={{ scale: roomState.lights.living || roomState.lights.master ? 1 : 0.2, opacity: roomState.lights.living || roomState.lights.master ? 1 : 0 }} transition={{ duration: 0.5 }}
                     style={{ width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(212,175,55,0.2) 0%, transparent 60%)', borderRadius: '50%' }} />
               </div>

               {/* Master Ambient Light */}
               <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 3 }}>
                  <motion.div animate={{ scale: roomState.lights.master ? 1 : 0.2, opacity: roomState.lights.master ? 1 : 0 }} transition={{ duration: 0.8 }}
                     style={{ width: '900px', height: '900px', background: 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
               </div>


               {/* Smoke Detector (Kitchen Ceiling) */}
               <div style={{ position: 'absolute', top: '15%', left: '20%', transform: 'translate(-50%, -50%)', zIndex: 20 }}>
                  <div style={{ width: '28px', height: '28px', background: '#111', borderRadius: '50%', border: '3px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <ShieldAlert size={14} color={roomState.smokeDetected ? '#ef4444' : '#555'} />
                  </div>
                  {/* Flashing Alarm Ring */}
                  <AnimatePresence>
                     {roomState.smokeDetected && (
                        <motion.div
                           animate={{ scale: [1, 5], opacity: [1, 0] }}
                           transition={{ duration: 1, repeat: Infinity }}
                           style={{ position: 'absolute', top: '-10px', left: '-10px', width: '48px', height: '48px', border: '4px solid #ef4444', borderRadius: '50%' }}
                        />
                     )}
                  </AnimatePresence>
               </div>


               {/* Smart Window & Curtains (Top Wall, Living Area) */}
               <div style={{ position: 'absolute', top: '-6px', left: '35%', right: '40%', height: '24px', background: '#111', overflow: 'hidden', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px', borderBottom: '3px solid #333', borderLeft: '3px solid #333', borderRight: '3px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 15 }}>
                  <span style={{ zIndex: 5, color: '#666', fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px' }}>SMART WINDOW</span>

                  {/* Window Contact Sensor */}
                  <div style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', zIndex: 20 }}>
                     <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: roomState.windowOpen?.living ? '#ef4444' : '#22c55e', boxShadow: `0 0 8px ${roomState.windowOpen?.living ? '#ef4444' : '#22c55e'}` }} />
                  </div>

                  {/* Sunlight/Outside Glow when open */}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #38bdf8, transparent)', opacity: roomState.curtains?.living ? 1 : 0, transition: 'opacity 1s ease' }} />

                  {/* Left Curtain */}
                  <motion.div
                     animate={{ width: roomState.curtains?.living ? '15%' : '50%' }}
                     transition={{ duration: 1.5, ease: 'easeInOut' }}
                     style={{ position: 'absolute', top: 0, bottom: 0, left: 0, background: '#10b981', boxShadow: '2px 0 10px rgba(0,0,0,0.5)', borderRight: '2px solid #059669' }}
                  />
                  {/* Right Curtain */}
                  <motion.div
                     animate={{ width: roomState.curtains?.living ? '15%' : '50%' }}
                     transition={{ duration: 1.5, ease: 'easeInOut' }}
                     style={{ position: 'absolute', top: 0, bottom: 0, right: 0, background: '#10b981', boxShadow: '-2px 0 10px rgba(0,0,0,0.5)', borderLeft: '2px solid #059669' }}
                  />
               </div>
               {/* Sun rays casting onto the floor */}
               <motion.div
                  animate={{ opacity: roomState.curtains?.living ? 0.2 : 0 }}
                  transition={{ duration: 1.5 }}
                  style={{ position: 'absolute', top: '18px', left: '35%', right: '40%', height: '400px', background: 'linear-gradient(180deg, rgba(56,189,248,0.5), transparent)', pointerEvents: 'none', zIndex: 1 }}
               />

               {/* Smart TV (Mounted on interior bedroom wall, facing living room sofa) */}
               <div style={{ position: 'absolute', bottom: '25%', right: '35%', width: '24px', height: '25%', background: '#0a0a0a', borderRadius: '12px 0 0 12px', borderTop: '3px solid #333', borderBottom: '3px solid #333', borderLeft: '3px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 12 }}>
                  <span style={{ transform: 'rotate(-90deg)', color: '#666', fontSize: '10px', fontWeight: 'bold', letterSpacing: '2px', zIndex: 10 }}>OLED</span>
                  <motion.div
                     animate={{ opacity: roomState.tv ? 1 : 0 }}
                     transition={{ duration: 0.3 }}
                     style={{ position: 'absolute', inset: '-3px', background: '#3b82f6', borderRadius: '12px 0 0 12px', boxShadow: '-40px 0 100px 30px rgba(59,130,246,0.5)' }}
                  />
                  {/* Screen Content Simulation (Light casting into living room) */}
                  <motion.div
                     animate={{ opacity: roomState.tv ? 0.5 : 0 }}
                     style={{ position: 'absolute', top: '10%', bottom: '10%', left: '-60px', width: '60px', background: 'linear-gradient(270deg, white, transparent)', filter: 'blur(10px)' }}
                  />
               </div>

               {/* HVAC / AC Vent (Left Wall, Hallway Zone) */}
               <div style={{ position: 'absolute', top: '50%', left: '-6px', width: '24px', height: '18%', background: '#1a1a1a', borderRadius: '0 12px 12px 0', borderTop: '3px solid #444', borderBottom: '3px solid #444', borderRight: '3px solid #444', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                  <span style={{ transform: 'rotate(90deg)', color: '#666', fontSize: '10px', fontWeight: 'bold', letterSpacing: '2px', zIndex: 10 }}>HVAC</span>
                  <AnimatePresence>
                     {roomState.ac.isOn && (
                        <motion.div
                           initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                           style={{ position: 'absolute', left: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}
                        >
                           {[0, 1, 2].map(i => {
                              const isCold = roomState.ac.temp <= 22;
                              const color = isCold ? '#38bdf8' : '#f87171';
                              return (
                                 <motion.div
                                    key={i}
                                    animate={{ x: [0, 200], opacity: [0.8, 0], scale: [1, 3] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                                    style={{ width: '40px', height: '6px', background: color, borderRadius: '3px', boxShadow: `0 0 15px ${color}` }}
                                 />
                              );
                           })}
                        </motion.div>
                     )}
                  </AnimatePresence>
               </div>

               {/* Main Door Lock (Bottom Wall, Entrance Hallway) */}
               <div style={{ position: 'absolute', bottom: '-6px', left: '15%', display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 15 }}>

                  <div style={{ position: 'relative', width: '150px', height: '150px' }}>
                     {/* Door swing arc */}
                     <div style={{ position: 'absolute', top: '-150px', left: '0', width: '150px', height: '150px', borderBottomRightRadius: '100%', borderBottom: '3px dashed #444', borderRight: '3px dashed #444', opacity: 0.5 }} />

                     {/* The Physical Door */}
                     <motion.div
                        animate={{
                           borderColor: roomState.doorLocked ? '#ef4444' : '#22c55e',
                           backgroundColor: roomState.doorLocked ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)',
                           rotate: roomState.doorLocked ? 0 : -75
                        }}
                        transition={{ type: 'spring', stiffness: 60 }}
                        style={{ position: 'absolute', top: '-3px', left: '0', width: '150px', height: '20px', border: '4px solid', borderRadius: '6px', transformOrigin: 'top left', boxShadow: roomState.doorLocked ? '0 0 30px rgba(239,68,68,0.4)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                     >
                        <span style={{ color: 'white', fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px' }}>MAIN ENTRANCE</span>
                     </motion.div>
                  </div>

                  {/* Status Label */}
                  <div style={{ position: 'absolute', top: '30px', left: '10px', display: 'flex', alignItems: 'center', gap: '8px', color: roomState.doorLocked ? '#ef4444' : '#22c55e', fontWeight: '600', textShadow: '0 2px 4px rgba(0,0,0,0.8)', background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '16px', width: 'max-content' }}>
                     {roomState.doorLocked ? <Lock size={16} /> : <Unlock size={16} />}
                     <span style={{ fontSize: '14px' }}>{roomState.doorLocked ? 'LOCKED' : 'UNLOCKED'}</span>
                  </div>
               </div>

               {/* Occupancy Heatmap/Pulse (Moving around the room) */}
               <AnimatePresence>
                  {roomState.occupancy && (
                     <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, x: [0, 200, 100, -100, 0], y: [0, -150, 100, 50, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                        style={{ position: 'absolute', top: '50%', left: '50%', width: '100px', height: '100px', pointerEvents: 'none', zIndex: 20 }}
                     >
                        {/* Person Icon / Center */}
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#f59e0b', borderRadius: '50%', padding: '10px', boxShadow: '0 0 20px rgba(245,158,11,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           <UserCheck size={24} color="white" />
                        </div>

                        {/* Radar Pulse */}
                        <motion.div
                           animate={{ scale: [1, 4], opacity: [0.8, 0] }}
                           transition={{ duration: 2.5, repeat: Infinity }}
                           style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle, rgba(245,158,11,0.5) 0%, transparent 70%)', borderRadius: '50%' }}
                        />
                     </motion.div>
                  )}
               </AnimatePresence>

            </div>
         </div>
      </div>
   );
}
