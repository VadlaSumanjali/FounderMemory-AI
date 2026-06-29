import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUserContext } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { startupId } = await getOrCreateUserContext();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // 1. Fetch full message history if a specific ID is queried
    if (id) {
      const conversation = await prisma.conversation.findUnique({
        where: { id },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!conversation || conversation.startupId !== startupId) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
      }

      return NextResponse.json(conversation);
    }

    // 2. Fetch list of conversations for the active startup
    const conversations = await prisma.conversation.findMany({
      where: { startupId },
      orderBy: [
        { isPinned: "desc" },
        { updatedAt: "desc" },
      ],
      include: {
        _count: {
          select: { messages: true },
        },
      },
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("GET /api/conversations error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { startupId } = await getOrCreateUserContext();
    const body = await req.json();
    const { id, title, isPinned } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing conversation ID" }, { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({ where: { id } });
    if (!conversation || conversation.startupId !== startupId) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const updated = await prisma.conversation.update({
      where: { id },
      data: {
        title: title !== undefined ? title : conversation.title,
        isPinned: isPinned !== undefined ? isPinned : conversation.isPinned,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/conversations error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { startupId } = await getOrCreateUserContext();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing conversation ID" }, { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({ where: { id } });
    if (!conversation || conversation.startupId !== startupId) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    await prisma.conversation.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/conversations error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
