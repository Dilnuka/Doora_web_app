"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

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

  const addLog = useCallback((message, source = "system") => {
    setLogs((prev) => [
      { id: Date.now() + Math.random(), message, source, timestamp: new Date().toLocaleTimeString() },
      ...prev,
    ].slice(0, 50));
  }, []);

  const setLight = useCallback((zone, state) => {
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
      return { ...prev, lights: newLights };
    });
    addLog(`MQTT: hotel/wingA/room204/light/${zone}/set -> ${state ? "ON" : "OFF"}`, "iot");
  }, [addLog]);

  const setAc = useCallback((isOn, temp) => {
    setRoomState((prev) => ({
      ...prev,
      ac: { isOn: isOn !== undefined ? isOn : prev.ac.isOn, temp: temp || prev.ac.temp }
    }));
    addLog(`MQTT: hotel/wingA/room204/ac/set -> ${isOn ? "ON" : "OFF"} ${temp ? temp+"°C" : ""}`, "iot");
  }, [addLog]);

  const setTv = useCallback((state) => {
    setRoomState((prev) => ({ ...prev, tv: state }));
    addLog(`MQTT: hotel/wingA/room204/tv/set -> ${state ? "ON" : "OFF"}`, "iot");
  }, [addLog]);

  const setCurtains = useCallback((state) => {
    setRoomState((prev) => ({ ...prev, curtains: state }));
    addLog(`MQTT: hotel/wingA/room204/curtains/set -> ${state ? "OPEN" : "CLOSED"}`, "iot");
  }, [addLog]);

  const setDoor = useCallback((lockedState) => {
    setRoomState((prev) => ({ ...prev, doorLocked: lockedState }));
    addLog(`MQTT: hotel/wingA/room204/door/set -> ${lockedState ? "LOCKED" : "UNLOCKED"}`, "iot");
  }, [addLog]);

  const setOccupancy = useCallback((state) => {
    setRoomState((prev) => ({ ...prev, occupancy: state }));
    addLog(`Sensor: hotel/wingA/room204/occupancy/status -> ${state ? "DETECTED" : "CLEAR"}`, "iot");
  }, [addLog]);

  const setSmoke = useCallback((state) => {
    setRoomState((prev) => ({ ...prev, smokeDetected: state }));
    addLog(`Sensor: hotel/wingA/room204/smoke/status -> ${state ? "ALARM" : "CLEAR"}`, "error");
  }, [addLog]);

  const setCoffee = useCallback((state) => {
    setRoomState((prev) => ({ ...prev, coffeeMaker: state }));
    addLog(`MQTT: hotel/wingA/room204/coffee/set -> ${state ? "BREWING" : "OFF"}`, "iot");
    if (state) {
      setTimeout(() => {
        setRoomState((prev) => ({ ...prev, coffeeMaker: false }));
        addLog(`MQTT: hotel/wingA/room204/coffee/status -> DONE`, "iot");
      }, 5000);
    }
  }, [addLog]);

  const setWindow = useCallback((state) => {
    setRoomState((prev) => ({ ...prev, windowOpen: state }));
    addLog(`Sensor: hotel/wingA/room204/window/status -> ${state ? "OPEN" : "CLOSED"}`, "iot");
  }, [addLog]);

  const addServiceRequest = useCallback((type, text) => {
    const newReq = { id: Date.now(), type, text, time: new Date().toLocaleTimeString() };
    setServiceQueue((prev) => [newReq, ...prev]);
    addLog(`ALE Rainbow API: New Request -> [${type}] ${text}`, "api");
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
