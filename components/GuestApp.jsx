"use client";
import React, { useState, useRef, useEffect } from "react";
import { useSimulation } from "@/context/SimulationContext";
import { Send, Lightbulb, Thermometer, Coffee, User, Tv, Blinds, Lock, Unlock, Smartphone, X, Flame, ShieldAlert, Wind, Mic, MicOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function GuestApp() {
  const { roomState, setLight, setAc, setTv, setCurtains, setDoor, setSmoke, setCoffee, setWindow, addServiceRequest, addLog } = useSimulation();
  const [messages, setMessages] = useState([{ role: "ai", content: "Welcome to Doora. How can I assist you today?" }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const endOfMessagesRef = useRef(null);
  const recognitionRef = useRef(null);
  const sendMessageRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        // Call the ref-backed send function directly
        if (sendMessageRef.current) {
          sendMessageRef.current(transcript);
        }
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        setInput("");
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        alert("Speech Recognition not supported in this browser.");
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  sendMessageRef.current = async (userMsg) => {
    if (!userMsg.trim()) return;
    
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setIsTyping(true);
    addLog(`Guest App: Sent message "${userMsg}"`, "client");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      
      if (data.tools) {
        data.tools.forEach(tool => {
          if (tool.name === "set_light") setLight(tool.args.zone, tool.args.state);
          if (tool.name === "set_temperature") setAc(true, tool.args.temp);
          if (tool.name === "place_order") addServiceRequest("Room Service", tool.args.item);
          if (tool.name === "set_tv") setTv(tool.args.state);
          if (tool.name === "set_curtains") setCurtains(tool.args.state);
          if (tool.name === "set_door") setDoor(tool.args.state);
          if (tool.name === "make_coffee") setCoffee(true);
          if (tool.name === "trigger_smoke") setSmoke(true);
          if (tool.name === "set_window") setWindow(tool.args.state);
        });
      }
      
      setMessages(prev => [...prev, { role: "ai", content: data.reply }]);
      addLog(`API Gateway: Responded with "${data.reply}"`, "api");
    } catch (err) {
      addLog(`API Error: ${err.message}`, "error");
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (sendMessageRef.current) {
      sendMessageRef.current(input);
    }
  };

  const QuickButton = ({ onClick, active, icon, label, color }) => (
    <button 
      onClick={onClick}
      style={{ 
        minWidth: '70px', padding: '10px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', 
        background: active ? `rgba(${color}, 0.2)` : 'rgba(255,255,255,0.03)', 
        border: `1px solid ${active ? `rgba(${color}, 0.5)` : 'rgba(255,255,255,0.05)'}`,
        borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s'
      }}
    >
      {icon}
      <span style={{ fontSize: '9px', color: '#cbd5e1', whiteSpace: 'nowrap' }}>{label}</span>
    </button>
  );

  return (
    <>
      {/* Floating Action Button */}
      <motion.button 
        onClick={() => setIsOpen(true)}
        initial={{ scale: 0 }}
        animate={{ scale: isOpen ? 0 : 1 }}
        style={{ position: 'fixed', bottom: '32px', left: '32px', zIndex: 100, width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-gold))', border: 'none', cursor: 'pointer', boxShadow: '0 10px 25px rgba(139,92,246,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Smartphone size={32} color="white" />
      </motion.button>

      {/* The Mobile App Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ y: '100%', opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: '100%', opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="glass-panel flex flex-col shadow-2xl" 
            style={{ position: 'fixed', bottom: '32px', left: '32px', zIndex: 100, width: '360px', height: 'calc(100vh - 64px)', maxHeight: '750px', borderRadius: '40px', border: '8px solid #232736', background: 'rgba(20,22,28,0.95)', overflow: 'hidden' }}
          >
             {/* Header */}
             <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)'}}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(to top right, var(--accent-gold), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(212,175,55,0.4)' }}>
                     <User size={20} color="white" />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: '600', fontSize: '18px', color: 'var(--accent-gold)', margin: 0 }}>Room 204</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>John Doe • Connected</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  <X size={24} />
                </button>
             </div>

             {/* Quick Controls (Scrollable row) */}
             <div style={{ padding: '16px', display: 'flex', overflowX: 'auto', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <QuickButton onClick={() => setLight('all', !roomState.lights.master)} active={roomState.lights.master} color="212,175,55" label="All Lights" icon={<Lightbulb size={20} color={roomState.lights.master ? "#d4af37" : "#94a3b8"} />} />
                <QuickButton onClick={() => setLight('bath', !roomState.lights.bath)} active={roomState.lights.bath} color="212,175,55" label="Bath Lights" icon={<Lightbulb size={20} color={roomState.lights.bath ? "#d4af37" : "#94a3b8"} />} />
                <QuickButton onClick={() => setLight('bed', !roomState.lights.bed)} active={roomState.lights.bed} color="212,175,55" label="Bed Lights" icon={<Lightbulb size={20} color={roomState.lights.bed ? "#d4af37" : "#94a3b8"} />} />
                <QuickButton onClick={() => setLight('living', !roomState.lights.living)} active={roomState.lights.living} color="212,175,55" label="Living Lights" icon={<Lightbulb size={20} color={roomState.lights.living ? "#d4af37" : "#94a3b8"} />} />
                <QuickButton onClick={() => setAc(!roomState.ac.isOn, roomState.ac.temp)} active={roomState.ac.isOn} color="139,92,246" label="AC" icon={<Thermometer size={20} color={roomState.ac.isOn ? "#8b5cf6" : "#94a3b8"} />} />
                <QuickButton onClick={() => setTv(!roomState.tv)} active={roomState.tv} color="59,130,246" label="TV" icon={<Tv size={20} color={roomState.tv ? "#3b82f6" : "#94a3b8"} />} />
                <QuickButton onClick={() => setCurtains(!roomState.curtains)} active={roomState.curtains} color="16,185,129" label="Curtains" icon={<Blinds size={20} color={roomState.curtains ? "#10b981" : "#94a3b8"} />} />
                <QuickButton onClick={() => setWindow(!roomState.windowOpen)} active={roomState.windowOpen} color="56,189,248" label="Window" icon={<Wind size={20} color={roomState.windowOpen ? "#38bdf8" : "#94a3b8"} />} />
                <QuickButton onClick={() => setDoor(!roomState.doorLocked)} active={roomState.doorLocked} color={roomState.doorLocked ? "239,68,68" : "34,197,94"} label="Door" icon={roomState.doorLocked ? <Lock size={20} color="#ef4444" /> : <Unlock size={20} color="#22c55e" />} />
                <QuickButton onClick={() => setCoffee(true)} active={roomState.coffeeMaker} color="139,92,246" label="Brew" icon={<Coffee size={20} color={roomState.coffeeMaker ? "#8b5cf6" : "#94a3b8"} />} />
                <QuickButton onClick={() => setSmoke(!roomState.smokeDetected)} active={roomState.smokeDetected} color="239,68,68" label="Alarm Test" icon={<ShieldAlert size={20} color={roomState.smokeDetected ? "#ef4444" : "#94a3b8"} />} />
             </div>

             {/* Chat Area */}
             <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
               {messages.map((msg, idx) => (
                 <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={idx} 
                    style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
                 >
                    <div style={{ padding: '12px', borderRadius: '16px', maxWidth: '80%', fontSize: '14px', lineHeight: '1.4', background: msg.role === 'user' ? 'var(--accent-purple)' : 'rgba(255,255,255,0.1)', color: msg.role === 'user' ? 'white' : 'var(--text-primary)', borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px', borderBottomLeftRadius: msg.role === 'ai' ? '4px' : '16px' }}>
                       {msg.content}
                    </div>
                 </motion.div>
               ))}
               {isTyping && (
                 <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <div style={{ padding: '12px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', fontSize: '14px' }}>Thinking...</div>
                 </div>
               )}
               <div ref={endOfMessagesRef} />
             </div>

             {/* Input Area */}
             <div style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
               <form onSubmit={handleSend} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <button 
                   type="button"
                   onClick={toggleListen}
                   style={{ padding: '10px', background: isListening ? '#ef4444' : 'rgba(255,255,255,0.1)', borderRadius: '50%', color: 'white', border: 'none', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                 >
                   {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                 </button>
                 <div style={{ position: 'relative', flex: 1 }}>
                   <input 
                     type="text" 
                     value={input}
                     onChange={(e) => setInput(e.target.value)}
                     placeholder={isListening ? "Listening..." : "Ask AI or say a command..."} 
                     style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '999px', padding: '12px 44px 12px 16px', fontSize: '14px', color: 'white', outline: 'none' }}
                   />
                   <button id="send-msg-btn" type="submit" style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', padding: '8px', background: 'var(--accent-purple)', borderRadius: '50%', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <Send size={16} />
                   </button>
                 </div>
               </form>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
