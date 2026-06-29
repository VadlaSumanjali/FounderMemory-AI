import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUserContext } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { extractJSONResponse } from "@/lib/openai";
import { retainMemory } from "@/lib/hindsight";

export async function GET() {
  try {
    const { startupId } = await getOrCreateUserContext();
    const journals = await prisma.journal.findMany({
      where: { startupId },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(journals);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { startupId } = await getOrCreateUserContext();
    const body = await req.json();
    const { title, content, date } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Missing title or reflection content" }, { status: 400 });
    }

    // 1. Analyze reflection using OpenAI for mood, milestones, and lessons
    const systemPrompt = `
      You are the CTO/CEO coach agent of FounderMemory AI.
      Analyze the founder's journal entry and extract:
      - Mood (e.g. "Stressed", "Productive", "Excited", "Overwhelmed", "Reflective", "Optimistic", "Determined")
      - Milestones (any business wins or metrics reached, e.g. "Launched landing page", "Reached 100 signups")
      - Key lessons learned (e.g. "Need to talk to customers earlier", "Prisma migrations need shadow DBs")
      Return JSON format:
      {
        "mood": "Optimistic",
        "milestones": "Completed core brain pipeline.",
        "lessons": "Keep schema changes incremental."
      }
    `;

    const analysis = await extractJSONResponse<{
      mood: string;
      milestones: string;
      lessons: string;
    }>(systemPrompt, content, {
      mood: "Reflective",
      milestones: "",
      lessons: "",
    });

    // 2. Save journal entry to database
    const journal = await prisma.journal.create({
      data: {
        startupId,
        title,
        content,
        date: date ? new Date(date) : new Date(),
        mood: analysis.mood,
        milestones: analysis.milestones || null,
        lessons: analysis.lessons || null,
      },
    });

    // 3. Store lessons and milestones in Hindsight long-term memory
    if (analysis.lessons || analysis.milestones) {
      const memoryText = `Founder reflection on ${journal.date.toLocaleDateString()}:
- **Mood**: ${analysis.mood}
- **Milestones**: ${analysis.milestones || "None"}
- **Lessons Learned**: ${analysis.lessons || "None"}`;

      await retainMemory({
        startupId,
        content: memoryText,
        category: "Journal",
        tags: ["journal", "reflection", analysis.mood.toLowerCase()],
        source: "journal",
        importance: 5,
        confidence: 0.9,
      });
    }

    return NextResponse.json(journal);
  } catch (error) {
    console.error("POST /api/journal error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
