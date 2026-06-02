"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo } from "react";
import mqtt from "mqtt";

const SimulationContext = createContext();

export const SimulationProvider = ({ children }) => {
  const [roomState, setRoomState] = useState({
    lights: {
      master: false,
      bath: false,
      bed: false,
      living: false,
    },
    ac: { isOn: true, temp: 22 },
    tv: false,
    curtains: false,
    doorLocked: true,
    occupancy: true,
    smokeDetected: false,
    coffeeMaker: false,
    windowOpen: false,
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

          if (data.type === "SYNC_STATE") {
            setRoomState(data.payload);
          } else if (data.type === "ADD_LOG") {
            setLogs((prev) => [data.payload, ...prev].slice(0, 50));
          } else if (data.type === "ADD_SERVICE") {
            setServiceQueue((prev) => [data.payload, ...prev]);
          }
        } catch (e) {
          console.error("Failed to parse MQTT message", e);
        }
      }
    });

    return () => {
      if (client) client.end();
    };
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
    let computedState;
    setRoomState((prev) => {
      const newLights = { ...prev.lights };
      if (zone === 'all' || zone === 'master') {
        newLights.master = state;
        newLights.bath = state;
        newLights.bed = state;
        newLights.living = state;
      } else if (newLights[zone] !== undefined) {
        newLights[zone] = state;
      }
      computedState = { ...prev, lights: newLights };
      return computedState;
    });
    setTimeout(() => publishState(computedState), 0);
    addLog(`MQTT: hotel/wingA/room204/light/${zone}/set -> ${state ? "ON" : "OFF"}`, "iot");
  }, [addLog]);

  const setAc = useCallback((isOn, temp) => {
    let computedState;
    setRoomState((prev) => {
      computedState = {
        ...prev,
        ac: { isOn: isOn !== undefined ? isOn : prev.ac.isOn, temp: temp || prev.ac.temp }
      };
      return computedState;
    });
    setTimeout(() => publishState(computedState), 0);
    addLog(`MQTT: hotel/wingA/room204/ac/set -> ${isOn ? "ON" : "OFF"} ${temp ? temp+"°C" : ""}`, "iot");
  }, [addLog]);

  const setTv = useCallback((state) => {
    let computedState;
    setRoomState((prev) => {
      computedState = { ...prev, tv: state };
      return computedState;
    });
    setTimeout(() => publishState(computedState), 0);
    addLog(`MQTT: hotel/wingA/room204/tv/set -> ${state ? "ON" : "OFF"}`, "iot");
  }, [addLog]);

  const setCurtains = useCallback((state) => {
    let computedState;
    setRoomState((prev) => {
      computedState = { ...prev, curtains: state };
      return computedState;
    });
    setTimeout(() => publishState(computedState), 0);
    addLog(`MQTT: hotel/wingA/room204/curtains/set -> ${state ? "OPEN" : "CLOSED"}`, "iot");
  }, [addLog]);

  const setDoor = useCallback((lockedState) => {
    let computedState;
    setRoomState((prev) => {
      computedState = { ...prev, doorLocked: lockedState };
      return computedState;
    });
    setTimeout(() => publishState(computedState), 0);
    addLog(`MQTT: hotel/wingA/room204/door/set -> ${lockedState ? "LOCKED" : "UNLOCKED"}`, "iot");
  }, [addLog]);

  const setOccupancy = useCallback((state) => {
    let computedState;
    setRoomState((prev) => {
      computedState = { ...prev, occupancy: state };
      return computedState;
    });
    setTimeout(() => publishState(computedState), 0);
    addLog(`Sensor: hotel/wingA/room204/occupancy/status -> ${state ? "DETECTED" : "CLEAR"}`, "iot");
  }, [addLog]);

  const setSmoke = useCallback((state) => {
    let computedState;
    setRoomState((prev) => {
      computedState = { ...prev, smokeDetected: state };
      return computedState;
    });
    setTimeout(() => publishState(computedState), 0);
    addLog(`Sensor: hotel/wingA/room204/smoke/status -> ${state ? "ALARM" : "CLEAR"}`, "error");
  }, [addLog]);

  const setCoffee = useCallback((state) => {
    let computedState;
    setRoomState((prev) => {
      computedState = { ...prev, coffeeMaker: state };
      return computedState;
    });
    setTimeout(() => publishState(computedState), 0);
    addLog(`MQTT: hotel/wingA/room204/coffee/set -> ${state ? "BREWING" : "OFF"}`, "iot");
    
    if (state) {
      setTimeout(() => {
        let doneState;
        setRoomState((prev) => {
          doneState = { ...prev, coffeeMaker: false };
          return doneState;
        });
        setTimeout(() => publishState(doneState), 0);
        addLog(`MQTT: hotel/wingA/room204/coffee/status -> DONE`, "iot");
      }, 5000);
    }
  }, [addLog]);

  const setWindow = useCallback((state) => {
    let computedState;
    setRoomState((prev) => {
      computedState = { ...prev, windowOpen: state };
      return computedState;
    });
    setTimeout(() => publishState(computedState), 0);
    addLog(`Sensor: hotel/wingA/room204/window/status -> ${state ? "OPEN" : "CLOSED"}`, "iot");
  }, [addLog]);

  return (
    <SimulationContext.Provider value={{ 
      roomState, setLight, setAc, setTv, setCurtains, setDoor, setOccupancy,
      setSmoke, setCoffee, setWindow,
      serviceQueue, addServiceRequest, 
      logs, addLog 
    }}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => useContext(SimulationContext);
