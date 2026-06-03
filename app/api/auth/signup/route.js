import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { name, email, password, selectedRoomId } = await req.json();

    if (!name || !email || !password || !selectedRoomId) {
      return NextResponse.json({ error: "Name, email, password, and room selection are required." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email is already in use." }, { status: 409 });
    }

    const existingRoom = await prisma.room.findUnique({ 
      where: { id: selectedRoomId },
      include: { user: true }
    });

    if (!existingRoom) {
      return NextResponse.json({ error: "Selected room does not exist." }, { status: 404 });
    }

    if (existingRoom.user) {
      return NextResponse.json({ error: "Selected room is already occupied." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "GUEST",
        roomId: selectedRoomId,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Unable to create account." }, { status: 500 });
  }
}
