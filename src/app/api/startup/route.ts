import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUserContext } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { ensureMemoryBank } from "@/lib/hindsight";

export async function GET() {
  try {
    const { startupId } = await getOrCreateUserContext();

    const startup = await prisma.startup.findUnique({
      where: { id: startupId },
      include: {
        _count: {
          select: {
            memories: true,
            documents: true,
            tasks: true,
            meetings: true,
            journals: true,
          },
        },
      },
    });

    if (!startup) {
      return NextResponse.json({ error: "Startup not found" }, { status: 404 });
    }

    // Register bank in Hindsight just in case it doesn't exist yet
    await ensureMemoryBank(startup.id, startup.name);

    return NextResponse.json(startup);
  } catch (error) {
    console.error("GET /api/startup error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { startupId } = await getOrCreateUserContext();
    const body = await req.json();

    // Whitelist update fields
    const {
      name,
      mission,
      vision,
      goals,
      customers,
      pricing,
      competitors,
      roadmap,
      decisions,
      deadlines,
      techStack,
      investorNotes,
    } = body;

    const updatedStartup = await prisma.startup.update({
      where: { id: startupId },
      data: {
        name,
        mission,
        vision,
        goals,
        customers,
        pricing,
        competitors,
        roadmap,
        decisions,
        deadlines,
        techStack,
        investorNotes,
      },
    });

    return NextResponse.json(updatedStartup);
  } catch (error) {
    console.error("PUT /api/startup error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
