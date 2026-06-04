import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function PUT(req, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { triggerPhrase, actions } = body;

    // Verify ownership
    const existing = await prisma.smartRoutine.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    const updatedRoutine = await prisma.smartRoutine.update({
      where: { id },
      data: { triggerPhrase, actions }
    });

    return NextResponse.json({ routine: updatedRoutine });
  } catch (error) {
    console.error("PUT /api/routines/[id]:", error);
    return NextResponse.json({ error: "Failed to update routine" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existing = await prisma.smartRoutine.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    await prisma.smartRoutine.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/routines/[id]:", error);
    return NextResponse.json({ error: "Failed to delete routine" }, { status: 500 });
  }
}
