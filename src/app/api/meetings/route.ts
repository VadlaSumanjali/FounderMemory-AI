import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUserContext } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { extractJSONResponse } from "@/lib/openai";
import { retainMemory } from "@/lib/hindsight";

export async function GET() {
  try {
    const { startupId } = await getOrCreateUserContext();
    const meetings = await prisma.meeting.findMany({
      where: { startupId },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(meetings);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { startupId } = await getOrCreateUserContext();
    const body = await req.json();
    const { title, date, transcript } = body;

    if (!title || !transcript) {
      return NextResponse.json({ error: "Missing title or transcript content" }, { status: 400 });
    }

    // 1. Process transcript using OpenAI to extract summary & action items
    const systemPrompt = `
      You are the Operations Agent of FounderMemory AI.
      Review the provided meeting transcript.
      Generate a concise summary (max 3 sentences) highlighting the key topics.
      Extract a JSON array of actionable next items (e.g. ["Assign logo design to Mark by Friday", "Migrate DB to Neon"]).
      Format your response exactly as:
      {
        "summary": "Meeting summary text.",
        "actionItems": ["Action Item 1", "Action Item 2"]
      }
    `;

    const processedResult = await extractJSONResponse<{
      summary: string;
      actionItems: string[];
    }>(systemPrompt, transcript, {
      summary: "Completed meeting discussion.",
      actionItems: [],
    });

    // 2. Save meeting to database
    const meeting = await prisma.meeting.create({
      data: {
        startupId,
        title,
        date: date ? new Date(date) : new Date(),
        transcript,
        summary: processedResult.summary,
        actionItems: processedResult.actionItems,
      },
    });

    // 3. Inject meeting decisions into Hindsight Memory Engine
    const memoryText = `In meeting "${title}" on ${meeting.date.toLocaleDateString()}, the following was summarized: ${processedResult.summary}. Action Items agreed: ${processedResult.actionItems.join(", ")}`;
    
    await retainMemory({
      startupId,
      content: memoryText,
      category: "Meeting",
      tags: ["meeting", title.toLowerCase().replace(/[^a-z0-9]/g, "-")],
      source: "meeting",
      importance: 6,
      confidence: 0.95,
    });

    // Also register each action item as a task suggestion
    for (const item of processedResult.actionItems) {
      await prisma.task.create({
        data: {
          startupId,
          title: item,
          description: `Extracted from meeting: ${title}`,
          priority: "MEDIUM",
          status: "TODO",
          aiSuggestions: `Automatically extracted from meeting on ${meeting.date.toLocaleDateString()}.`,
        },
      });
    }

    return NextResponse.json(meeting);
  } catch (error) {
    console.error("POST /api/meetings error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
