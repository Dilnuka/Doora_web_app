import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parsePersistedRoomSnapshot } from "@/lib/roomState";

export const runtime = "nodejs";

async function getSessionRoomId() {
  const session = await auth();
  const roomId = session?.user?.roomId;
  if (!roomId) {
    return { error: NextResponse.json({ error: "No room assigned to this account." }, { status: 403 }) };
  }
  return { roomId };
}

export async function GET() {
  try {
    const result = await getSessionRoomId();
    if (result.error) return result.error;

    const room = await prisma.room.findUnique({
      where: { id: result.roomId },
      select: { state: true },
    });

    const snapshot = parsePersistedRoomSnapshot(room?.state);
    if (!snapshot) {
      return NextResponse.json({ roomState: null, serviceQueue: [], logs: [] });
    }

    return NextResponse.json(snapshot);
  } catch (error) {
    console.error("GET /api/room/state:", error);
    return NextResponse.json({ error: "Failed to load room state." }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const result = await getSessionRoomId();
    if (result.error) return result.error;

    const body = await req.json();
    if (!body?.roomState || typeof body.roomState !== "object") {
      return NextResponse.json({ error: "roomState is required." }, { status: 400 });
    }

    const payload = {
      roomState: body.roomState,
      serviceQueue: Array.isArray(body.serviceQueue) ? body.serviceQueue.slice(0, 30) : [],
      logs: Array.isArray(body.logs) ? body.logs.slice(0, 50) : [],
      updatedAt: new Date().toISOString(),
    };

    await prisma.room.update({
      where: { id: result.roomId },
      data: { state: payload },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PUT /api/room/state:", error);
    return NextResponse.json({ error: "Failed to save room state." }, { status: 500 });
  }
}
