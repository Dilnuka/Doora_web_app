"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo } from "react";
import mqtt from "mqtt";

const SimulationContext = createContext();

export const SimulationProvider = ({ children }) => {
  const [roomState, setRoomState] = useState({
    lights: {
      master: false,
      kitchen: false,
      bath: false,
      bed: false,
      living: false,
    },
    ac: { isOn: true, temp: 22 },
    ambientTemp: 24.5, // The actual temperature in the room
    tv: false,
    curtains: { living: false, bed: false },
    doorLocked: true,
    occupancy: true,
    smokeDetected: false,
    coffeeMaker: false,
    windowOpen: { living: false, bed: false },
    alarm: { enabled: false, time: '07:00', ringing: false },
  });

  const [serviceQueue, setServiceQueue] = useState([]);
  const [logs, setLogs] = useState([]);
  
  const mqttClientRef = useRef(null);
  const clientId = useMemo(() => Math.random().toString(36).substring(7), []);
  const TOPIC_SYNC = "doora/demo/suite204/sync";

  useEffect(() => {
    // Connect to public HiveMQ WebSocket broker
    const client = mqtt.connect("wss://broker.hivemq.com:8884/mqtt");
    mqttClientRef.current = client;

    client.on("connect", () => {
      console.log("Connected to HiveMQ MQTT Broker");
      client.subscribe(TOPIC_SYNC);
      addLog("System: Connected to Cloud MQTT Broker", "system");
    });

    client.on("message", (topic, message) => {
      if (topic === TOPIC_SYNC) {
        try {
          const data = JSON.parse(message.toString());
          // Ignore messages we published ourselves to prevent loops
          if (data.clientId === clientId) return;

          if (data.type === "SYNC_STATE" && data.payload) {
            // Merge payload to preserve new fields like ambientTemp from legacy clients
            setRoomState(prev => ({ ...prev, ...data.payload }));
          } else if (data.type === "ADD_LOG" && data.payload) {
            setLogs((prev) => [data.payload, ...prev].slice(0, 50));
          } else if (data.type === "ADD_SERVICE" && data.payload) {
            setServiceQueue((prev) => [data.payload, ...prev]);
          }
        } catch (e) {
          console.error("Failed to parse MQTT message", e);
        }
      }
    });

    // Simulate Ambient Temperature changes based on AC
    const tempInterval = setInterval(() => {
      setRoomState(prev => {
        if (!prev) return prev; // Guard against undefined state
        
        let current = prev.ambientTemp !== undefined ? prev.ambientTemp : 24.5;
        const target = prev.ac?.isOn ? prev.ac.temp : 28.0; // Default warm outside temp
        
        if (Math.abs(current - target) < 0.1) {
          if (prev.ambientTemp === undefined) return { ...prev, ambientTemp: current };
          return prev;
        }
        
        // Move towards target by 0.1 degrees
        current += current < target ? 0.1 : -0.1;
        const newState = { ...prev, ambientTemp: Number(current.toFixed(1)) };
        
        // Broadcast the ambient temp change
        if (client && client.connected) {
          client.publish(TOPIC_SYNC, JSON.stringify({
            clientId,
            type: "SYNC_STATE",
            payload: newState
          }));
        }
        return newState;
      });
    }, 5000);

    return () => {
      clearInterval(tempInterval);
      if (client) client.end();
    };
  }, [clientId]);

  // Alarm clock — check every 15 seconds if alarm should ring
  useEffect(() => {
    const alarmInterval = setInterval(() => {
      setRoomState(prev => {
        if (!prev.alarm?.enabled || prev.alarm?.ringing) return prev;
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        if (currentTime === prev.alarm.time) {
          const newState = { ...prev, alarm: { ...prev.alarm, ringing: true } };
          if (mqttClientRef.current?.connected) {
            mqttClientRef.current.publish(TOPIC_SYNC, JSON.stringify({ clientId, type: 'SYNC_STATE', payload: newState }));
          }
          return newState;
        }
        return prev;
      });
    }, 15000);
    return () => clearInterval(alarmInterval);
  }, [clientId]);

  // Helper to publish state changes
  const publishState = (newState) => {
    if (mqttClientRef.current && mqttClientRef.current.connected) {
      mqttClientRef.current.publish(TOPIC_SYNC, JSON.stringify({
        clientId,
        type: "SYNC_STATE",
        payload: newState
      }));
    }
  };

  const addLog = useCallback((message, source = "system") => {
    const logEntry = { id: Date.now() + Math.random(), message, source, timestamp: new Date().toLocaleTimeString() };
    setLogs((prev) => [logEntry, ...prev].slice(0, 50));
    
    if (mqttClientRef.current && mqttClientRef.current.connected) {
      mqttClientRef.current.publish(TOPIC_SYNC, JSON.stringify({
        clientId,
        type: "ADD_LOG",
        payload: logEntry
      }));
    }
  }, [clientId]);

  const addServiceRequest = useCallback((type, text) => {
    const newReq = { id: Date.now(), type, text, time: new Date().toLocaleTimeString() };
    setServiceQueue((prev) => [newReq, ...prev]);
    
    if (mqttClientRef.current && mqttClientRef.current.connected) {
      mqttClientRef.current.publish(TOPIC_SYNC, JSON.stringify({
        clientId,
        type: "ADD_SERVICE",
        payload: newReq
      }));
    }
    addLog(`ALE Rainbow API: New Request -> [${type}] ${text}`, "api");
  }, [addLog, clientId]);

  const setLight = useCallback((zone, state) => {
    setRoomState((prev) => {
      const newLights = { ...prev.lights };
      if (zone === 'all' || zone === 'master') {
        newLights.master = state;
        newLights.kitchen = state;
        newLights.bath = state;
        newLights.bed = state;
        newLights.living = state;
      } else if (newLights[zone] !== undefined) {
        newLights[zone] = state;
      }
      const computedState = { ...prev, lights: newLights };
      publishState(computedState);
      return computedState;
    });
    addLog(`MQTT: hotel/wingA/room204/light/${zone}/set -> ${state ? "ON" : "OFF"}`, "iot");
  }, [addLog]);

  const setAc = useCallback((isOn, temp) => {
    setRoomState((prev) => {
      const computedState = {
        ...prev,
        ac: { isOn: isOn !== undefined ? isOn : prev.ac.isOn, temp: temp || prev.ac.temp }
      };
      publishState(computedState);
      return computedState;
    });
    addLog(`MQTT: hotel/wingA/room204/ac/set -> ${isOn ? "ON" : "OFF"} ${temp ? temp+"°C" : ""}`, "iot");
  }, [addLog]);

  const setTv = useCallback((state) => {
    setRoomState((prev) => {
      const computedState = { ...prev, tv: state };
      publishState(computedState);
      return computedState;
    });
    addLog(`MQTT: hotel/wingA/room204/tv/set -> ${state ? "ON" : "OFF"}`, "iot");
  }, [addLog]);

  const setCurtains = useCallback((zone, state) => {
    setRoomState((prev) => {
      const newCurtains = typeof prev.curtains === 'object' ? { ...prev.curtains } : { living: prev.curtains, bed: prev.curtains };
      newCurtains[zone] = state;
      const computedState = { ...prev, curtains: newCurtains };
      publishState(computedState);
      return computedState;
    });
    addLog(`MQTT: hotel/wingA/room204/curtains/${zone}/set -> ${state ? "OPEN" : "CLOSED"}`, "iot");
  }, [addLog]);

  const setDoor = useCallback((lockedState) => {
    setRoomState((prev) => {
      const computedState = { ...prev, doorLocked: lockedState };
      publishState(computedState);
      return computedState;
    });
    addLog(`MQTT: hotel/wingA/room204/door/set -> ${lockedState ? "LOCKED" : "UNLOCKED"}`, "iot");
  }, [addLog]);

  const setOccupancy = useCallback((state) => {
    setRoomState((prev) => {
      const computedState = { ...prev, occupancy: state };
      publishState(computedState);
      return computedState;
    });
    addLog(`Sensor: hotel/wingA/room204/occupancy/status -> ${state ? "DETECTED" : "CLEAR"}`, "iot");
  }, [addLog]);

  const setSmoke = useCallback((state) => {
    setRoomState((prev) => {
      const computedState = { ...prev, smokeDetected: state };
      publishState(computedState);
      return computedState;
    });
    addLog(`Sensor: hotel/wingA/room204/smoke/status -> ${state ? "ALARM" : "CLEAR"}`, "error");
  }, [addLog]);

  const setCoffee = useCallback((state) => {
    setRoomState((prev) => {
      const computedState = { ...prev, coffeeMaker: state };
      publishState(computedState);
      return computedState;
    });
    addLog(`MQTT: hotel/wingA/room204/coffee/set -> ${state ? "BREWING" : "OFF"}`, "iot");
    
    if (state) {
      setTimeout(() => {
        setRoomState((prev) => {
          const doneState = { ...prev, coffeeMaker: false };
          publishState(doneState);
          return doneState;
        });
        addLog(`MQTT: hotel/wingA/room204/coffee/status -> DONE`, "iot");
      }, 5000);
    }
  }, [addLog]);

  const setWindow = useCallback((zone, state) => {
    setRoomState((prev) => {
      const newWindows = typeof prev.windowOpen === 'object' ? { ...prev.windowOpen } : { living: prev.windowOpen, bed: prev.windowOpen };
      newWindows[zone] = state;
      const computedState = { ...prev, windowOpen: newWindows };
      publishState(computedState);
      return computedState;
    });
    addLog(`Sensor: hotel/wingA/room204/window/${zone}/status -> ${state ? "OPEN" : "CLOSED"}`, "iot");
  }, [addLog]);

  const setAlarm = useCallback((enabled, time) => {
    setRoomState((prev) => {
      const computedState = { ...prev, alarm: { enabled, time: time || prev.alarm?.time || '07:00', ringing: false } };
      publishState(computedState);
      return computedState;
    });
    addLog(`System: Alarm ${enabled ? 'set for ' + (time || '07:00') : 'disabled'}`, 'system');
  }, [addLog]);

  const dismissAlarm = useCallback(() => {
    setRoomState((prev) => {
      const computedState = { ...prev, alarm: { ...prev.alarm, ringing: false, enabled: false } };
      publishState(computedState);
      return computedState;
    });
    addLog('System: Alarm dismissed', 'system');
  }, [addLog]);

  return (
    <SimulationContext.Provider value={{ 
      roomState, setLight, setAc, setTv, setCurtains, setDoor, setOccupancy,
      setSmoke, setCoffee, setWindow, setAlarm, dismissAlarm,
      serviceQueue, addServiceRequest, 
      logs, addLog 
    }}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => useContext(SimulationContext);
