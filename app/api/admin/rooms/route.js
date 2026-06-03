import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parsePersistedRoomSnapshot } from "@/lib/roomState";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const rooms = await prisma.room.findMany({
      orderBy: { code: 'asc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    const formattedRooms = rooms.map(room => {
      const snapshot = parsePersistedRoomSnapshot(room.state);
      return {
        id: room.id,
        code: room.code,
        name: room.name,
        state: snapshot?.roomState || null,
        lastUpdated: snapshot?.updatedAt || null,
        // True occupancy = a guest user is assigned to this room in the DB
        hasGuest: !!room.user,
        guestName: room.user?.name || room.user?.email || null,
      };
    });

    return NextResponse.json({ rooms: formattedRooms });
  } catch (error) {
    console.error("GET /api/admin/rooms:", error);
    return NextResponse.json({ error: "Failed to fetch hotel rooms." }, { status: 500 });
  }
}
