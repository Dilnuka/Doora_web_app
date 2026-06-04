import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const DEFAULT_ROUTINES = [
  {
    triggerPhrase: "Good Morning",
    actions: {
      light_master: "on",
      light_kitchen: "on",
      light_bath: "on",
      light_bed: "on",
      light_living: "on",
      curtains_bed: "open",
      curtains_living: "open",
      ac_power: "on",
      ac_temp: 24
    }
  },
  {
    triggerPhrase: "Good Night",
    actions: {
      light_master: "off",
      light_kitchen: "off",
      light_bath: "off",
      light_bed: "off",
      light_living: "off",
      curtains_bed: "close",
      curtains_living: "close",
      door: "lock",
      ac_power: "on",
      ac_temp: 22
    }
  },
  {
    triggerPhrase: "Movie Time",
    actions: {
      light_master: "off",
      light_kitchen: "off",
      light_bath: "off",
      light_bed: "off",
      light_living: "off",
      curtains_living: "close",
      tv: "on"
    }
  },
  {
    triggerPhrase: "Leave Room",
    actions: {
      light_master: "off",
      light_kitchen: "off",
      light_bath: "off",
      light_bed: "off",
      light_living: "off",
      tv: "off",
      ac_power: "off",
      door: "lock"
    }
  }
];

export async function GET(req) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    let routines = await prisma.smartRoutine.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' }
    });

    // Seed defaults if empty
    if (routines.length === 0) {
      const dataToInsert = DEFAULT_ROUTINES.map(routine => ({
        userId,
        triggerPhrase: routine.triggerPhrase,
        actions: routine.actions
      }));

      await prisma.smartRoutine.createMany({
        data: dataToInsert
      });

      routines = await prisma.smartRoutine.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' }
      });
    }

    return NextResponse.json({ routines });
  } catch (error) {
    console.error("GET /api/routines:", error);
    return NextResponse.json({ error: "Failed to fetch routines" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { triggerPhrase, actions } = body;

    if (!triggerPhrase || !actions) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newRoutine = await prisma.smartRoutine.create({
      data: {
        userId: session.user.id,
        triggerPhrase,
        actions
      }
    });

    return NextResponse.json({ routine: newRoutine }, { status: 201 });
  } catch (error) {
    console.error("POST /api/routines:", error);
    return NextResponse.json({ error: "Failed to create routine" }, { status: 500 });
  }
}
