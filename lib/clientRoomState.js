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

export async function loadRoomSnapshot() {
  const res = await fetch("/api/room/state");
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Load failed (${res.status})`);
  }
  return res.json();
}
