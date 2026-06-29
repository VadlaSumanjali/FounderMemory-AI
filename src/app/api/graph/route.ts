import { NextResponse } from "next/server";
import { getOrCreateUserContext } from "@/lib/auth-helper";
import { buildKnowledgeGraph } from "@/lib/brain/knowledge-graph";

export async function GET() {
  try {
    const { startupId } = await getOrCreateUserContext();
    const graphData = await buildKnowledgeGraph(startupId);
    return NextResponse.json(graphData);
  } catch (error) {
    console.error("GET /api/graph error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
