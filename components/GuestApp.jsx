"use client";
import React, { useState, useRef, useEffect } from "react";
import { useSimulation } from "@/context/SimulationContext";
import { Send, Lightbulb, Thermometer, User, Tv, Blinds, Lock, Unlock, Wind, Mic, MicOff, Cloud, Sun, CloudRain, Power, Plus, Minus, MapPin, ShieldAlert, AlarmClock, BellRing, LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

export default function GuestApp() {
  const { roomState, setLight, setAc, setTv, setCurtains, setDoor, setWindow, setCoffee, setSmoke, addLog, setAlarm, dismissAlarm } = useSimulation();
  const { data: session } = useSession();
  const displayName = session?.user?.name || session?.user?.email || "Guest";
  const roomLabel = session?.user?.roomCode || "Private Suite";
  
  const [messages, setMessages] = useState([{ role: "ai", content: "Welcome to Doora. How can I assist you today?" }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  // Weather API state
  const [weather, setWeather] = useState({ temp: "--", condition: "Loading...", location: "Locating..." });
  const [activeRoom, setActiveRoom] = useState("Living Area");

  const endOfMessagesRef = useRef(null);
  const recognitionRef = useRef(null);
  const sendMessageRef = useRef(null);

  // Fetch Weather & Location
  useEffect(() => {
    async function fetchWeather() {
      try {
        const geoRes = await fetch("https://get.geojs.io/v1/ip/geo.json");
        const geoData = await geoRes.json();
        const lat = geoData.latitude || "52.52";
        const lon = geoData.longitude || "13.41";
        const city = geoData.city || "Berlin";

        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const data = await res.json();
        const code = data.current_weather.weathercode;
        let condition = "Clear";
        if (code > 0 && code <= 3) condition = "Cloudy";
        if (code > 3) condition = "Rainy";
        
        setWeather({ temp: data.current_weather.temperature, condition, location: city });
      } catch (err) {
        setWeather({ temp: "--", condition: "Unavailable", location: "Unknown Location" });
      }
    }
    fetchWeather();
  }, []);

  // Speech Recognition Setup
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
        if (sendMessageRef.current) sendMessageRef.current(transcript);
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
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
          if (tool.name === "set_tv") setTv(tool.args.state);
          if (tool.name === "set_curtains") setCurtains(tool.args.zone || 'living', tool.args.state);
          if (tool.name === "set_door") setDoor(tool.args.state);
          if (tool.name === "set_window") setWindow(tool.args.zone || 'living', tool.args.state);
          if (tool.name === "set_alarm") setAlarm(tool.args.enabled, tool.args.time);
          if (tool.name === "dismiss_alarm") dismissAlarm();
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
    if (sendMessageRef.current) sendMessageRef.current(input);
  };

  const getWeatherIcon = () => {
    if (weather.condition === "Clear") return <Sun size={48} color="#fcd34d" />;
    if (weather.condition === "Cloudy") return <Cloud size={48} color="#94a3b8" />;
    return <CloudRain size={48} color="#3b82f6" />;
  };

  const DeviceCard = ({ title, icon, active, onClick, activeColor }) => (
    <div 
      onClick={onClick}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${active ? activeColor : 'rgba(255,255,255,0.05)'}`,
        borderRadius: '24px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: active ? `0 8px 32px ${activeColor}20` : 'none',
        height: '100%',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ 
          width: '56px', height: '56px', borderRadius: '50%', 
          background: active ? activeColor : 'rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {React.cloneElement(icon, { color: active ? 'white' : '#94a3b8', size: 28 })}
        </div>
        <div style={{ width: '48px', height: '28px', borderRadius: '14px', background: active ? activeColor : 'rgba(255,255,255,0.1)', position: 'relative', transition: '0.3s' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: active ? '22px' : '2px', transition: '0.3s' }} />
        </div>
      </div>
      <div>
        <h4 style={{ margin: 0, color: 'white', fontSize: '20px', fontWeight: '500' }}>{title}</h4>
        <p style={{ margin: '8px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>{active ? 'ONLINE' : 'OFFLINE'}</p>
      </div>
    </div>
  );

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0a0b10', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      
      {/* Desktop Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '40px 60px', paddingBottom: '160px' }}>
        
        {/* Top Header & Weather Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.1)' }}>
              <User size={40} color="white" />
            </div>
            <div>
              <p style={{ color: '#94a3b8', margin: 0, fontSize: '18px' }}>Welcome back,</p>
              <h2 style={{ color: 'white', margin: '4px 0 0 0', fontSize: '36px', fontWeight: 'bold' }}>{displayName}</h2>
              <p style={{ color: '#3b82f6', margin: '4px 0 0 0', fontSize: '14px', fontWeight: '500' }}>{roomLabel} • Connected</p>
            </div>
            {/* Logout button */}
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              title="Sign out"
              style={{
                marginLeft: '16px',
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            >
              <LogOut size={20} color="#94a3b8" />
            </button>
          </div>

          <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '32px', padding: '24px 40px', display: 'flex', gap: '40px', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', marginBottom: '8px' }}>
                <MapPin size={16} color="#38bdf8" />
                <p style={{ margin: 0, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>{weather.location}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <h1 style={{ color: 'white', margin: 0, fontSize: '56px', fontWeight: '300', lineHeight: 1 }}>{weather.temp}°</h1>
                <span style={{ color: '#38bdf8', fontSize: '20px', marginTop: '4px', fontWeight: '500' }}>C</span>
              </div>
              <p style={{ color: 'white', margin: '8px 0 0 0', fontSize: '18px' }}>{weather.condition}</p>
            </div>
            <div style={{ paddingLeft: '40px', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
              {getWeatherIcon()}
            </div>
          </div>
        </div>

        {/* Room Tabs */}
        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', marginBottom: '40px', scrollbarWidth: 'none' }}>
          {['Entrance', 'Kitchen', 'Living Area', 'Bedroom', 'Bathroom'].map(room => (
            <button 
              key={room}
              onClick={() => setActiveRoom(room)}
              style={{ 
                padding: '16px 32px', borderRadius: '30px', whiteSpace: 'nowrap', border: 'none', cursor: 'pointer',
                background: activeRoom === room ? 'white' : 'rgba(255,255,255,0.05)',
                color: activeRoom === room ? 'black' : '#94a3b8',
                fontSize: '16px',
                fontWeight: activeRoom === room ? '600' : '400',
                transition: 'all 0.2s'
              }}
            >
              {room}
            </button>
          ))}
        </div>

        {/* Main 2-Column Dashboard Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '40px' }}>
          
          {/* Left Column: AC Controller */}
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '40px', padding: '40px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
              <div>
                <h3 style={{ color: 'white', margin: 0, fontSize: '24px' }}>Air Conditioner</h3>
                <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '14px' }}>{activeRoom}</p>
              </div>
              <button 
                onClick={() => setAc(!roomState.ac.isOn, roomState.ac.temp)}
                style={{ background: roomState.ac.isOn ? '#10b981' : 'rgba(255,255,255,0.1)', border: 'none', padding: '16px', borderRadius: '50%', cursor: 'pointer', transition: 'all 0.3s' }}
              >
                <Power size={24} color="white" />
              </button>
            </div>
            
            {/* Circular Dial */}
            <div style={{ position: 'relative', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: '2px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: roomState.ac.isOn ? '0 0 60px rgba(56, 189, 248, 0.15)' : 'none' }}>
              <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                <circle cx="150" cy="150" r="135" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                {roomState.ac.isOn && (
                  <circle cx="150" cy="150" r="135" fill="none" stroke="#38bdf8" strokeWidth="12" strokeDasharray="848" strokeDashoffset={848 - (848 * (roomState.ac.temp - 16) / 14)} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
                )}
              </svg>
              
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 8px 0', letterSpacing: '2px' }}>TARGET</p>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
                  <span style={{ color: roomState.ac.isOn ? 'white' : '#64748b', fontSize: '72px', fontWeight: 'bold', lineHeight: 1 }}>{roomState.ac.temp}</span>
                  <span style={{ color: roomState.ac.isOn ? '#38bdf8' : '#64748b', fontSize: '24px', fontWeight: 'bold', marginTop: '8px' }}>°</span>
                </div>
                <div style={{ marginTop: '16px', padding: '8px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <p style={{ color: '#38bdf8', fontSize: '14px', margin: 0 }}>Ambient: {roomState.ambientTemp}°C</p>
                </div>
              </div>

              {/* Controls */}
              {roomState.ac.isOn && (
                <>
                  <button onClick={() => setAc(true, Math.max(16, roomState.ac.temp - 1))} style={{ position: 'absolute', left: '-24px', top: '50%', transform: 'translateY(-50%)', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white', width: '56px', height: '56px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}><Minus size={24} /></button>
                  <button onClick={() => setAc(true, Math.min(30, roomState.ac.temp + 1))} style={{ position: 'absolute', right: '-24px', top: '50%', transform: 'translateY(-50%)', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white', width: '56px', height: '56px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}><Plus size={24} /></button>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Device Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px', alignContent: 'start', paddingBottom: '120px' }}>
            
            {/* Entrance Devices */}
            {activeRoom === 'Entrance' && (
              <>
                <DeviceCard title="Front Door" icon={roomState.doorLocked ? <Lock /> : <Unlock />} active={!roomState.doorLocked} onClick={() => setDoor(!roomState.doorLocked)} activeColor="#ef4444" />
                <DeviceCard title="Master Lights" icon={<Lightbulb />} active={roomState.lights.master} onClick={() => setLight('master', !roomState.lights.master)} activeColor="#eab308" />
              </>
            )}

            {/* Kitchen Devices */}
            {activeRoom === 'Kitchen' && (
              <>
                <DeviceCard title="Kitchen Lights" icon={<Lightbulb />} active={roomState.lights.kitchen || roomState.lights.master} onClick={() => setLight('kitchen', !roomState.lights.kitchen)} activeColor="#eab308" />
                <DeviceCard title="Coffee Maker" icon={<Power />} active={roomState.coffeeMaker} onClick={() => setCoffee(!roomState.coffeeMaker)} activeColor="#8b5cf6" />
                <DeviceCard title="Smoke Alarm" icon={<ShieldAlert />} active={roomState.smokeDetected} onClick={() => setSmoke(!roomState.smokeDetected)} activeColor="#ef4444" />
              </>
            )}

            {/* Living Area Devices */}
            {activeRoom === 'Living Area' && (
              <>
                <DeviceCard title="OLED TV" icon={<Tv />} active={roomState.tv} onClick={() => setTv(!roomState.tv)} activeColor="#3b82f6" />
                <DeviceCard title="Living Lights" icon={<Lightbulb />} active={roomState.lights.living || roomState.lights.master} onClick={() => setLight('living', !roomState.lights.living)} activeColor="#eab308" />
                <DeviceCard title="Smart Window" icon={<Wind />} active={roomState.windowOpen?.living} onClick={() => setWindow('living', !roomState.windowOpen?.living)} activeColor="#0ea5e9" />
                <DeviceCard title="Living Curtains" icon={<Blinds />} active={roomState.curtains?.living} onClick={() => setCurtains('living', !roomState.curtains?.living)} activeColor="#10b981" />
              </>
            )}

            {/* Bedroom Devices */}
            {activeRoom === 'Bedroom' && (
              <>
                <DeviceCard title="Bed Lights" icon={<Lightbulb />} active={roomState.lights.bed || roomState.lights.master} onClick={() => setLight('bed', !roomState.lights.bed)} activeColor="#eab308" />
                <DeviceCard title="Bedroom Window" icon={<Wind />} active={roomState.windowOpen?.bed} onClick={() => setWindow('bed', !roomState.windowOpen?.bed)} activeColor="#0ea5e9" />
                <DeviceCard title="Bedroom Curtains" icon={<Blinds />} active={roomState.curtains?.bed} onClick={() => setCurtains('bed', !roomState.curtains?.bed)} activeColor="#10b981" />

                {/* Alarm Clock Card */}
                <div style={{
                  background: roomState.alarm?.ringing ? 'rgba(249,115,22,0.1)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${roomState.alarm?.ringing ? '#f97316' : roomState.alarm?.enabled ? 'rgba(249,115,22,0.35)' : 'rgba(255,255,255,0.05)'}`,
                  borderRadius: '24px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  boxShadow: roomState.alarm?.ringing ? '0 8px 32px rgba(249,115,22,0.35)' : roomState.alarm?.enabled ? '0 4px 20px rgba(249,115,22,0.1)' : 'none',
                  transition: 'all 0.3s ease',
                }}>
                  {/* Header row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{
                      width: '56px', height: '56px', borderRadius: '50%',
                      background: roomState.alarm?.enabled ? '#f97316' : 'rgba(255,255,255,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {roomState.alarm?.ringing
                        ? <BellRing color="white" size={28} />
                        : <AlarmClock color={roomState.alarm?.enabled ? 'white' : '#94a3b8'} size={28} />}
                    </div>
                    {/* Toggle */}
                    <div
                      onClick={() => setAlarm(!roomState.alarm?.enabled, roomState.alarm?.time)}
                      style={{ width: '48px', height: '28px', borderRadius: '14px', background: roomState.alarm?.enabled ? '#f97316' : 'rgba(255,255,255,0.1)', position: 'relative', cursor: 'pointer', transition: '0.3s' }}
                    >
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: roomState.alarm?.enabled ? '22px' : '2px', transition: '0.3s' }} />
                    </div>
                  </div>

                  {/* Label */}
                  <div>
                    <h4 style={{ margin: 0, color: 'white', fontSize: '20px', fontWeight: '500' }}>Alarm Clock</h4>
                    <p style={{ margin: '6px 0 0 0', color: roomState.alarm?.ringing ? '#f97316' : '#94a3b8', fontSize: '14px', fontWeight: roomState.alarm?.ringing ? '600' : '400' }}>
                      {roomState.alarm?.ringing ? '🔔 RINGING NOW' : roomState.alarm?.enabled ? `Set for ${roomState.alarm?.time}` : 'OFFLINE'}
                    </p>
                  </div>

                  {/* Time picker */}
                  <input
                    type="time"
                    value={roomState.alarm?.time || '07:00'}
                    onChange={(e) => setAlarm(roomState.alarm?.enabled || false, e.target.value)}
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '12px',
                      color: 'white',
                      padding: '10px 16px',
                      fontSize: '20px',
                      width: '100%',
                      cursor: 'pointer',
                      outline: 'none',
                      boxSizing: 'border-box',
                      colorScheme: 'dark',
                    }}
                  />

                  {/* Dismiss button — only shows when ringing */}
                  {roomState.alarm?.ringing && (
                    <button
                      onClick={dismissAlarm}
                      style={{
                        background: '#f97316', border: 'none', borderRadius: '14px',
                        color: 'white', padding: '14px', fontSize: '15px', fontWeight: '700',
                        cursor: 'pointer', letterSpacing: '2px', transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#ea6c00'}
                      onMouseOut={(e) => e.currentTarget.style.background = '#f97316'}
                    >
                      DISMISS ALARM
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Bathroom Devices */}
            {activeRoom === 'Bathroom' && (
              <>
                <DeviceCard title="Bath Lights" icon={<Lightbulb />} active={roomState.lights.bath || roomState.lights.master} onClick={() => setLight('bath', !roomState.lights.bath)} activeColor="#eab308" />
              </>
            )}

          </div>

        </div>
      </div>

      {/* Floating Centered AI Chat Bar */}
      <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Recent Chat Bubble */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          {messages.slice(-1).map((msg, idx) => (
            <div key={idx} style={{ padding: '16px 24px', borderRadius: '24px', maxWidth: '80%', fontSize: '16px', lineHeight: '1.5', background: msg.role === 'user' ? '#3b82f6' : 'rgba(255,255,255,0.1)', color: 'white', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
              {isTyping && msg.role === 'user' ? "Thinking..." : msg.content}
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(20,22,28,0.8)', padding: '12px 12px 12px 24px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(20px)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
          <button 
            type="button"
            onClick={toggleListen}
            style={{ width: '48px', height: '48px', background: isListening ? '#ef4444' : 'rgba(255,255,255,0.05)', borderRadius: '50%', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}
          >
            {isListening ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening..." : "Ask Doora to do something..."} 
            style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', fontSize: '18px', outline: 'none' }}
          />
          <button type="submit" style={{ width: '56px', height: '56px', background: '#3b82f6', borderRadius: '50%', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.3s' }} onMouseOver={(e) => e.currentTarget.style.background = '#2563eb'} onMouseOut={(e) => e.currentTarget.style.background = '#3b82f6'}>
            <Send size={24} />
          </button>
        </form>
      </div>

    </div>
  );
}
