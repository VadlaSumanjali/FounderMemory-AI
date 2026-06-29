import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUserContext } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { extractJSONResponse } from "@/lib/openai";

export async function GET() {
  try {
    const { startupId } = await getOrCreateUserContext();
    const tasks = await prisma.task.findMany({
      where: { startupId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { startupId } = await getOrCreateUserContext();
    const { searchParams } = new URL(req.url);
    const suggest = searchParams.get("suggest") === "true";

    // AI SUGGEST ROUTINE
    if (suggest) {
      // Fetch decisions and startup details to generate suggestions
      const memories = await prisma.memory.findMany({
        where: { startupId, category: "Decision" },
        orderBy: { createdAt: "desc" },
        take: 10,
      });

      const existingTasks = await prisma.task.findMany({
        where: { startupId, status: { in: ["TODO", "IN_PROGRESS"] } },
        select: { title: true },
      });

      const systemPrompt = `
        You are the Product Manager Agent of FounderMemory AI.
        Based on the startup's recent key decisions and existing tasks, suggest 3 highly actionable next tasks/actions.
        Ensure these tasks do not duplicate the existing tasks.
        Assign appropriate Priorities ("LOW" | "MEDIUM" | "HIGH").
        Provide a concise AI recommendation text explaining why this task is suggested.
        Return JSON format:
        {
          "suggestions": [
            {
              "title": "Short task title",
              "description": "Elaborated action item details",
              "priority": "HIGH",
              "aiSuggestions": "Suggested based on decision: (mention decision reference)"
            }
          ]
        }
      `;

      const userMsg = `
        Decisions: ${JSON.stringify(memories.map(m => m.content))}
        Existing Tasks: ${JSON.stringify(existingTasks.map(t => t.title))}
      `;

      const response = await extractJSONResponse<{
        suggestions: Array<{
          title: string;
          description: string;
          priority: "LOW" | "MEDIUM" | "HIGH";
          aiSuggestions: string;
        }>;
      }>(systemPrompt, userMsg, { suggestions: [] });

      return NextResponse.json(response.suggestions);
    }

    // MANUAL CREATE ROUTINE
    const body = await req.json();
    const { title, description, priority, deadline, status } = body;

    if (!title) {
      return NextResponse.json({ error: "Missing task title" }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        startupId,
        title,
        description,
        priority: priority || "MEDIUM",
        deadline: deadline ? new Date(deadline) : null,
        status: status || "TODO",
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("POST /api/tasks error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { startupId } = await getOrCreateUserContext();
    const body = await req.json();
    const { id, title, description, priority, deadline, status, aiSuggestions } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing task ID" }, { status: 400 });
    }

    // Verify task belongs to this startup
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task || task.startupId !== startupId) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        priority,
        deadline: deadline ? new Date(deadline) : null,
        status,
        aiSuggestions,
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("PUT /api/tasks error:", error);
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
      return NextResponse.json({ error: "Missing task ID" }, { status: 400 });
    }

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task || task.startupId !== startupId) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await prisma.task.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/tasks error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
