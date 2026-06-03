import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parsePersistedRoomSnapshot } from "@/lib/roomState";

export const runtime = "nodejs";

// Admin-only endpoint: GET /api/admin/room-state?roomId=<id>
// Loads the persisted state for any specific room by its DB id.
export async function GET(req) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");

    if (!roomId) {
      return NextResponse.json({ error: "roomId query param is required." }, { status: 400 });
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: { state: true, code: true, name: true },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found." }, { status: 404 });
    }

    const snapshot = parsePersistedRoomSnapshot(room?.state);
    if (!snapshot) {
      return NextResponse.json({ roomState: null, serviceQueue: [], logs: [], roomCode: room.code, roomName: room.name });
    }

    return NextResponse.json({ ...snapshot, roomCode: room.code, roomName: room.name });
  } catch (error) {
    console.error("GET /api/admin/room-state:", error);
    return NextResponse.json({ error: "Failed to load room state." }, { status: 500 });
  }
}
