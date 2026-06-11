"use client";
import React, { useState, useRef, useEffect } from "react";
import { useSimulation } from "@/context/SimulationContext";
import { Send, Lightbulb, Thermometer, User, Tv, Blinds, Lock, Unlock, Wind, Mic, MicOff, Cloud, Sun, CloudRain, Power, Plus, Minus, MapPin, ShieldAlert, AlarmClock, BellRing, LogOut, ArrowLeft, Clock, List } from "lucide-react";
import SmartRoutinesModal from "./SmartRoutinesModal";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import styles from "./GuestApp.module.css";

// Time of Day Animation Component
const TimeAnimation = ({ period }) => {
  if (period === "morning") {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ filter: 'drop-shadow(0 0 4px #eab308)' }}>
        <line x1="2" y1="18" x2="22" y2="18" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
        <motion.path
          d="M6 18c0-3.3 2.7-6 6-6s6 2.7 6 6"
          stroke="#f59e0b"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ y: 4, opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />
        <motion.path
          d="M12 4v3M7 7l2 2M17 7l-2 2"
          stroke="#fbbf24"
          strokeWidth="2"
          strokeLinecap="round"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    );
  }
  
  if (period === "afternoon") {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ filter: 'drop-shadow(0 0 6px #eab308)' }}>
        <motion.circle
          cx="12"
          cy="12"
          r="5"
          fill="#f59e0b"
          stroke="#fbbf24"
          strokeWidth="2"
          animate={{ scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ originX: "12px", originY: "12px" }}
        >
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5l1.5 1.5M5 19l1.5-1.5M17.5 6.5l1.5-1.5" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
        </motion.g>
      </svg>
    );
  }
  
  if (period === "evening") {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ filter: 'drop-shadow(0 0 4px #f97316)' }}>
        <line x1="2" y1="18" x2="22" y2="18" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
        <motion.path
          d="M7 18c0-2.8 2.2-5 5-5s5 2.2 5 5"
          stroke="#ea580c"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ y: -2 }}
          animate={{ y: 2 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />
        <motion.path
          d="M12 6v2M8 9l1.5 1.5M16 9l-1.5 1.5"
          stroke="#f97316"
          strokeWidth="1.5"
          strokeLinecap="round"
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    );
  }
  
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ filter: 'drop-shadow(0 0 6px #60a5fa)' }}>
      <motion.path
        d="M12 3a9 9 0 1 0 9 9 9.75 9.75 0 0 1-9-9Z"
        fill="#3b82f6"
        stroke="#60a5fa"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={{ rotate: [-2, 2, -2] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.path
        d="M19 5l.5 1.5L21 7l-1.5.5L19 9l-.5-1.5L17 7l1.5-.5L19 5Z"
        fill="#ffffff"
        animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        style={{ originX: "19px", originY: "7px" }}
      />
    </svg>
  );
};

// Time tracking hook
const useTimeOfDay = () => {
  const [timeState, setTimeState] = useState({
    timeStr: "",
    dateStr: "",
    fullDateStr: "",
    period: "afternoon",
    label: "Day",
    color: "#3b82f6"
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      const timeStr = `${displayHours}:${minutes} ${ampm}`;

      const daysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const dateStr = `${daysShort[now.getDay()]}, ${monthsShort[now.getMonth()]} ${now.getDate()}`;

      const daysFull = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const monthsFull = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const fullDateStr = `${daysFull[now.getDay()]}, ${monthsFull[now.getMonth()]} ${now.getDate()}`;

      let period = "afternoon";
      let label = "Day";
      let color = "#38bdf8";

      if (hours >= 6 && hours < 12) {
        period = "morning";
        label = "Morning";
        color = "#eab308";
      } else if (hours >= 12 && hours < 17) {
        period = "afternoon";
        label = "Day";
        color = "#38bdf8";
      } else if (hours >= 17 && hours < 20) {
        period = "evening";
        label = "Evening";
        color = "#f97316";
      } else {
        period = "night";
        label = "Night";
        color = "#60a5fa";
      }

      setTimeState({ timeStr, dateStr, fullDateStr, period, label, color });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return timeState;
};

export default function GuestApp() {
  const { roomState, setLight, setAc, setTv, setCurtains, setDoor, setWindow, setCoffee, setSmoke, addLog, setAlarm, dismissAlarm, signOutAndSave } = useSimulation();
  const { data: session } = useSession();
  const { timeStr, dateStr, fullDateStr, period, label, color: periodColor } = useTimeOfDay();
  const displayName = session?.user?.name || session?.user?.email || "Guest";
  const roomLabel = session?.user?.roomCode || "Private Suite";
  
  const [messages, setMessages] = useState([{ role: "ai", content: "Welcome to Doora. How can I assist you today?" }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  // Weather API state
  const [weather, setWeather] = useState({ temp: "--", condition: "Loading...", location: "Locating..." });
  const [activeRoom, setActiveRoom] = useState("Living Area");
  const [routinesOpen, setRoutinesOpen] = useState(false);

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
          if (tool.name === "set_ac_power") setAc(tool.args.state, undefined);
          if (tool.name === "set_tv") setTv(tool.args.state);
          if (tool.name === "set_curtains") {
            if (tool.args.zone === "all") {
              setCurtains('living', tool.args.state);
              setCurtains('bed', tool.args.state);
            } else {
              setCurtains(tool.args.zone || 'living', tool.args.state);
            }
          }
          if (tool.name === "set_door") setDoor(tool.args.state);
          if (tool.name === "set_window") {
            if (tool.args.zone === "all") {
              setWindow('living', tool.args.state);
              setWindow('bed', tool.args.state);
            } else {
              setWindow(tool.args.zone || 'living', tool.args.state);
            }
          }
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
      className={styles.deviceCard}
      style={{
        border: `1px solid ${active ? activeColor : "rgba(255,255,255,0.05)"}`,
        boxShadow: active ? `0 8px 32px ${activeColor}20` : "none",
      }}
    >
      <div className={styles.deviceCardHeader}>
        <div
          className={styles.deviceIcon}
          style={{ background: active ? activeColor : "rgba(255,255,255,0.05)" }}
        >
          {React.cloneElement(icon, { color: active ? "white" : "#94a3b8", size: 28 })}
        </div>
        <div
          className={styles.deviceToggle}
          style={{ background: active ? activeColor : "rgba(255,255,255,0.1)" }}
        >
          <div
            className={styles.deviceToggleKnob}
            style={{ left: active ? "22px" : "2px" }}
          />
        </div>
      </div>
      <div>
        <h4 className={styles.deviceTitle}>{title}</h4>
        <p className={styles.deviceStatus}>{active ? "ONLINE" : "OFFLINE"}</p>
      </div>
    </div>
  );

  const acArcLength = 2 * Math.PI * 135;
  const acArcOffset = acArcLength - (acArcLength * (roomState.ac.temp - 16) / 14);

  return (
    <div className={styles.app}>
      <div className={styles.scroll}>
        <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <button type="button" className={styles.iconBtn} title="Back to selecting screen">
                <ArrowLeft size={20} />
              </button>
            </Link>
            <div className={styles.avatar}>
              <User size={40} color="white" />
            </div>
            <div className={styles.userText}>
              <p className={styles.welcome}>Welcome back,</p>
              <h2 className={styles.userName}>{displayName}</h2>
              <p className={styles.roomMeta}>{roomLabel} • Connected</p>
            </div>
            <button
              type="button"
              onClick={() => signOutAndSave()}
              title="Sign out"
              className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
            >
              <LogOut size={20} />
            </button>
          </div>

          <div className={styles.headerCards}>
            <div className={styles.infoCard}>
              <div className={styles.infoCardBody}>
                <div className={styles.infoCardLabel}>
                  <Clock size={16} color={periodColor} />
                  <p>System Time</p>
                </div>
                <div className={styles.timeRow}>
                  <h1 className={styles.timeValue}>{timeStr.split(" ")[0]}</h1>
                  <span className={styles.timePeriod} style={{ color: periodColor }}>
                    {timeStr.split(" ")[1]}
                  </span>
                </div>
                <p className={styles.timeSub}>
                  {fullDateStr} • <span style={{ color: "white", fontWeight: 500 }}>{label} Mode</span>
                </p>
              </div>
              <div className={styles.infoCardIcon}>
                <TimeAnimation period={period} />
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoCardBody}>
                <div className={styles.infoCardLabel}>
                  <MapPin size={16} color="#38bdf8" />
                  <p>{weather.location}</p>
                </div>
                <div className={styles.timeRow}>
                  <h1 className={styles.weatherTemp}>{weather.temp}°</h1>
                  <span style={{ color: "#38bdf8", fontSize: "1.25rem", fontWeight: 500 }}>C</span>
                </div>
                <p className={styles.timeSub} style={{ color: "white" }}>{weather.condition}</p>
              </div>
              <div className={styles.infoCardIcon}>{getWeatherIcon()}</div>
            </div>

            <button type="button" onClick={() => setRoutinesOpen(true)} className={styles.routinesBtn}>
              <div className={styles.routinesIcon}>
                <List size={24} color="white" />
              </div>
              <span className={styles.routinesLabel}>Smart Routines</span>
            </button>
          </div>
        </header>

        <div className={styles.roomTabs}>
          {["Entrance", "Kitchen", "Living Area", "Bedroom", "Bathroom"].map((room) => (
            <button
              key={room}
              type="button"
              onClick={() => setActiveRoom(room)}
              className={`${styles.roomTab} ${activeRoom === room ? styles.roomTabActive : styles.roomTabInactive}`}
            >
              {room}
            </button>
          ))}
        </div>

        <div className={styles.dashboard}>
          <section className={styles.acPanel}>
            <div className={styles.acHeader}>
              <div>
                <h3 className={styles.acTitle}>Air Conditioner</h3>
                <p className={styles.acSubtitle}>{activeRoom}</p>
              </div>
              <button
                type="button"
                onClick={() => setAc(!roomState.ac.isOn, roomState.ac.temp)}
                className={`${styles.powerBtn} ${roomState.ac.isOn ? styles.powerBtnOn : styles.powerBtnOff}`}
              >
                <Power size={24} color="white" />
              </button>
            </div>

            <div className={styles.acDialWrap}>
              <div className={`${styles.acDial} ${roomState.ac.isOn ? styles.acDialOn : ""}`}>
                <svg viewBox="0 0 300 300" className={styles.acDialSvg} aria-hidden="true">
                  <circle cx="150" cy="150" r="135" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                  {roomState.ac.isOn && (
                    <circle
                      cx="150"
                      cy="150"
                      r="135"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="12"
                      strokeDasharray={acArcLength}
                      strokeDashoffset={acArcOffset}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset 0.5s ease" }}
                    />
                  )}
                </svg>

                <div className={styles.acDialCenter}>
                  <p className={styles.acDialLabel}>TARGET</p>
                  <div className={styles.acDialTemp}>
                    <span
                      className={styles.acDialTempValue}
                      style={{ color: roomState.ac.isOn ? "white" : "#64748b" }}
                    >
                      {roomState.ac.temp}
                    </span>
                    <span
                      className={styles.acDialTempUnit}
                      style={{ color: roomState.ac.isOn ? "#38bdf8" : "#64748b" }}
                    >
                      °
                    </span>
                  </div>
                  <div className={styles.acDialAmbient}>
                    <p>Ambient: {roomState.ambientTemp}°C</p>
                  </div>
                </div>

                {roomState.ac.isOn && (
                  <>
                    <button
                      type="button"
                      onClick={() => setAc(true, Math.max(16, roomState.ac.temp - 1))}
                      className={`${styles.acDialBtn} ${styles.acDialBtnMinus}`}
                      aria-label="Decrease temperature"
                    >
                      <Minus size={24} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setAc(true, Math.min(30, roomState.ac.temp + 1))}
                      className={`${styles.acDialBtn} ${styles.acDialBtnPlus}`}
                      aria-label="Increase temperature"
                    >
                      <Plus size={24} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>

          <div className={styles.deviceGrid}>
            
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
                <DeviceCard title="Kitchen Lights" icon={<Lightbulb />} active={roomState.lights.kitchen} onClick={() => setLight('kitchen', !roomState.lights.kitchen)} activeColor="#eab308" />
                <DeviceCard title="Coffee Maker" icon={<Power />} active={roomState.coffeeMaker} onClick={() => setCoffee(!roomState.coffeeMaker)} activeColor="#8b5cf6" />
                <DeviceCard title="Smoke Alarm" icon={<ShieldAlert />} active={roomState.smokeDetected} onClick={() => setSmoke(!roomState.smokeDetected)} activeColor="#ef4444" />
              </>
            )}

            {/* Living Area Devices */}
            {activeRoom === 'Living Area' && (
              <>
                <DeviceCard title="OLED TV" icon={<Tv />} active={roomState.tv} onClick={() => setTv(!roomState.tv)} activeColor="#3b82f6" />
                <DeviceCard title="Living Lights" icon={<Lightbulb />} active={roomState.lights.living} onClick={() => setLight('living', !roomState.lights.living)} activeColor="#eab308" />
                <DeviceCard title="Smart Window" icon={<Wind />} active={roomState.windowOpen?.living} onClick={() => setWindow('living', !roomState.windowOpen?.living)} activeColor="#0ea5e9" />
                <DeviceCard title="Living Curtains" icon={<Blinds />} active={roomState.curtains?.living} onClick={() => setCurtains('living', !roomState.curtains?.living)} activeColor="#10b981" />
              </>
            )}

            {/* Bedroom Devices */}
            {activeRoom === 'Bedroom' && (
              <>
                <DeviceCard title="Bed Lights" icon={<Lightbulb />} active={roomState.lights.bed} onClick={() => setLight('bed', !roomState.lights.bed)} activeColor="#eab308" />
                <DeviceCard title="Bedroom Window" icon={<Wind />} active={roomState.windowOpen?.bed} onClick={() => setWindow('bed', !roomState.windowOpen?.bed)} activeColor="#0ea5e9" />
                <DeviceCard title="Bedroom Curtains" icon={<Blinds />} active={roomState.curtains?.bed} onClick={() => setCurtains('bed', !roomState.curtains?.bed)} activeColor="#10b981" />

                <div
                  className={styles.alarmCard}
                  style={{
                    background: roomState.alarm?.ringing ? "rgba(249,115,22,0.1)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${roomState.alarm?.ringing ? "#f97316" : roomState.alarm?.enabled ? "rgba(249,115,22,0.35)" : "rgba(255,255,255,0.05)"}`,
                    boxShadow: roomState.alarm?.ringing
                      ? "0 8px 32px rgba(249,115,22,0.35)"
                      : roomState.alarm?.enabled
                        ? "0 4px 20px rgba(249,115,22,0.1)"
                        : "none",
                  }}
                >
                  <div className={styles.deviceCardHeader}>
                    <div
                      className={styles.deviceIcon}
                      style={{ background: roomState.alarm?.enabled ? "#f97316" : "rgba(255,255,255,0.05)" }}
                    >
                      {roomState.alarm?.ringing ? (
                        <BellRing color="white" size={28} />
                      ) : (
                        <AlarmClock color={roomState.alarm?.enabled ? "white" : "#94a3b8"} size={28} />
                      )}
                    </div>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setAlarm(!roomState.alarm?.enabled, roomState.alarm?.time)}
                      onKeyDown={(e) => e.key === "Enter" && setAlarm(!roomState.alarm?.enabled, roomState.alarm?.time)}
                      className={styles.deviceToggle}
                      style={{ background: roomState.alarm?.enabled ? "#f97316" : "rgba(255,255,255,0.1)", cursor: "pointer" }}
                    >
                      <div
                        className={styles.deviceToggleKnob}
                        style={{ left: roomState.alarm?.enabled ? "22px" : "2px" }}
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className={styles.deviceTitle}>Alarm Clock</h4>
                    <p
                      className={styles.deviceStatus}
                      style={{
                        color: roomState.alarm?.ringing ? "#f97316" : "#94a3b8",
                        fontWeight: roomState.alarm?.ringing ? 600 : 400,
                      }}
                    >
                      {roomState.alarm?.ringing
                        ? "🔔 RINGING NOW"
                        : roomState.alarm?.enabled
                          ? `Set for ${roomState.alarm?.time}`
                          : "OFFLINE"}
                    </p>
                  </div>

                  <input
                    type="time"
                    value={roomState.alarm?.time || "07:00"}
                    onChange={(e) => setAlarm(roomState.alarm?.enabled || false, e.target.value)}
                    className={styles.alarmTimeInput}
                  />

                  {roomState.alarm?.ringing && (
                    <button type="button" onClick={dismissAlarm} className={styles.alarmDismiss}>
                      DISMISS ALARM
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Bathroom Devices */}
            {activeRoom === 'Bathroom' && (
              <>
                <DeviceCard title="Bath Lights" icon={<Lightbulb />} active={roomState.lights.bath} onClick={() => setLight('bath', !roomState.lights.bath)} activeColor="#eab308" />
              </>
            )}

          </div>
        </div>

        <div ref={endOfMessagesRef} aria-hidden="true" style={{ height: 1 }} />
        </div>
      </div>

      <div className={styles.chatFloat} aria-label="Doora assistant">
        <div className={styles.chatBubbleFloat} aria-live="polite">
          {messages.slice(-1).map((msg, idx) => (
            <div
              key={idx}
              className={`${styles.chatBubble} ${msg.role === "user" ? styles.chatBubbleUser : styles.chatBubbleAi}`}
            >
              {isTyping && msg.role === "user" ? "Thinking..." : msg.content}
            </div>
          ))}
        </div>
        <form onSubmit={handleSend} className={styles.chatFormFloat}>
          <button
            type="button"
            onClick={toggleListen}
            className={`${styles.micBtn} ${isListening ? styles.micBtnActive : styles.micBtnIdle}`}
            aria-label={isListening ? "Stop listening" : "Start voice input"}
          >
            {isListening ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening..." : "Ask Doora to do something..."}
            className={styles.chatInput}
          />
          <button type="submit" className={styles.sendBtn} aria-label="Send message">
            <Send size={24} />
          </button>
        </form>
      </div>

      <SmartRoutinesModal
        isOpen={routinesOpen} 
        onClose={() => setRoutinesOpen(false)} 
        onTrigger={(phrase) => {
          setRoutinesOpen(false);
          if (sendMessageRef.current) sendMessageRef.current(phrase);
        }}
      />
    </div>
  );
}
