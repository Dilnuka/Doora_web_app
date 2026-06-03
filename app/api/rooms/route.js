import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: { code: 'asc' },
      include: { user: { select: { id: true } } },
    });

    const formattedRooms = rooms
      .filter(room => room.code !== 'ADMIN-ROOM') // Don't allow guest signups for Admin room
      .map(room => {
        return {
          id: room.id,
          code: room.code,
          name: room.name,
          isAvailable: !room.user, // If no user is attached, it's available
        };
      });

    return NextResponse.json({ rooms: formattedRooms });
  } catch (error) {
    console.error("GET /api/rooms:", error);
    return NextResponse.json({ error: "Failed to fetch rooms." }, { status: 500 });
  }
}
