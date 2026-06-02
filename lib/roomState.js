export const DEFAULT_ROOM_STATE = {
  lights: {
    master: false,
    kitchen: false,
    bath: false,
    bed: false,
    living: false,
  },
  ac: { isOn: true, temp: 22 },
  ambientTemp: 24.5,
  tv: false,
  curtains: { living: false, bed: false },
  doorLocked: true,
  occupancy: true,
  smokeDetected: false,
  coffeeMaker: false,
  windowOpen: { living: false, bed: false },
  alarm: { enabled: false, time: "07:00", ringing: false },
};

export function mergeRoomState(partial) {
  if (!partial || typeof partial !== "object") {
    return { ...DEFAULT_ROOM_STATE };
  }

  const curtains =
    typeof partial.curtains === "object"
      ? { ...DEFAULT_ROOM_STATE.curtains, ...partial.curtains }
      : DEFAULT_ROOM_STATE.curtains;

  const windowOpen =
    typeof partial.windowOpen === "object"
      ? { ...DEFAULT_ROOM_STATE.windowOpen, ...partial.windowOpen }
      : DEFAULT_ROOM_STATE.windowOpen;

  return {
    ...DEFAULT_ROOM_STATE,
    ...partial,
    lights: { ...DEFAULT_ROOM_STATE.lights, ...(partial.lights || {}) },
    ac: { ...DEFAULT_ROOM_STATE.ac, ...(partial.ac || {}) },
    curtains,
    windowOpen,
    alarm: { ...DEFAULT_ROOM_STATE.alarm, ...(partial.alarm || {}) },
  };
}

export function parsePersistedRoomSnapshot(raw) {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  return {
    roomState: raw.roomState ? mergeRoomState(raw.roomState) : null,
    serviceQueue: Array.isArray(raw.serviceQueue) ? raw.serviceQueue : [],
    logs: Array.isArray(raw.logs) ? raw.logs : [],
  };
}
