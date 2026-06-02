import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function generateRoomCode() {
  return `ROOM-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email is already in use." }, { status: 409 });
    }

    let roomCode = generateRoomCode();
    let attempts = 0;
    while (attempts < 5) {
      const existingRoom = await prisma.room.findUnique({ where: { code: roomCode } });
      if (!existingRoom) break;
      roomCode = generateRoomCode();
      attempts += 1;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction(async (tx) => {
      const room = await tx.room.create({
        data: {
          code: roomCode,
          name: `Suite ${roomCode}`,
        },
      });

      await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "GUEST",
          roomId: room.id,
        },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Unable to create account." }, { status: 500 });
  }
}
