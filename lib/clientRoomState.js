/** Browser helper — persist room snapshot while session cookie is still valid. */
export async function persistRoomSnapshot(snapshot) {
  const res = await fetch("/api/room/state", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(snapshot),
    keepalive: true,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Save failed (${res.status})`);
  }
  return res.json();
}

/**
 * Load a room snapshot.
 * @param {string|null} adminRoomId  When set (admin viewing another room), loads via admin endpoint.
 */
export async function loadRoomSnapshot(adminRoomId = null) {
  const url = adminRoomId
    ? `/api/admin/room-state?roomId=${encodeURIComponent(adminRoomId)}`
    : "/api/room/state";
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Load failed (${res.status})`);
  }
  return res.json();
}

