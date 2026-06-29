import { extractJSONResponse } from "../openai";
import { retainMemory } from "../hindsight";

export interface ExtractedFact {
  content: string;
  category:
    | "Startup"
    | "Decision"
    | "Customer"
    | "Investor"
    | "Meeting"
    | "Task"
    | "Idea"
    | "Bug"
    | "Competitor"
    | "Feature"
    | "Goal"
    | "Roadmap"
    | "Document"
    | "Journal"
    | "Technical"
    | "Product"
    | "Marketing"
    | "Finance";
  importance: number; // 1-10
  confidence: number; // 0.0-1.0
  tags: string[];
}

interface ExtractionResult {
  memories: ExtractedFact[];
}

/**
 * Extracts and persists new structured memory facts from a conversation interaction.
 */
export async function extractAndStoreMemories(params: {
  startupId: string;
  userMessage: string;
  assistantResponse: string;
  conversationId?: string;
}): Promise<ExtractedFact[]> {
  const { startupId, userMessage, assistantResponse, conversationId } = params;

  const systemPrompt = `
    You are the Memory Extractor of the FounderMemory AI Startup Operating System.
    Review the conversation exchange between a startup founder (User) and the AI Co-Founder (Assistant).
    Extract any durable, structured facts that the AI Co-Founder should remember long-term about the startup.
    Focus on extracting:
    - Product decisions (e.g., "The team decided to build a Kanban board for tasks.")
    - Pricing / revenue model details (e.g., "SaaS pricing set to $29/month.")
    - Target customers / feedback (e.g., "Venture-backed founders are the key customer segment.")
    - Architecture / tech stack (e.g., "Using Next.js 15, Prisma, and PostgreSQL.")
    - Deadlines and goals (e.g., "Product launch date is set for September 1st.")
    - Competitor insights or investor notes.

    Categories must be exactly one of:
    "Startup", "Decision", "Customer", "Investor", "Meeting", "Task", "Idea", "Bug", "Competitor", "Feature", "Goal", "Roadmap", "Document", "Journal", "Technical", "Product", "Marketing", "Finance".

    Set Importance on a scale from 1 (minor detail) to 10 (critical pivot).
    Set Confidence from 0.0 to 1.0 depending on how clear and finalized the statement is.
    Extract key phrase tags for each memory (e.g. ["pricing", "saas"], ["tech-stack", "prisma"]).

    Return a valid JSON object matching the format:
    {
      "memories": [
        {
          "content": "A singular clear fact summary",
          "category": "Decision",
          "importance": 8,
          "confidence": 0.95,
          "tags": ["pricing", "subscription"]
        }
      ]
    }
    If no new facts are established, return an empty array.
  `;

  const inputMessage = `
    Founder (User): "${userMessage}"
    AI Co-Founder (Assistant): "${assistantResponse}"
  `;

  try {
    const result = await extractJSONResponse<ExtractionResult>(systemPrompt, inputMessage, {
      memories: [],
    });

    if (result && result.memories && result.memories.length > 0) {
      for (const fact of result.memories) {
        // Save to dual memory stores: Hindsight + PostgreSQL
        await retainMemory({
          startupId,
          content: fact.content,
          category: fact.category,
          tags: fact.tags,
          conversationId,
          source: "chat",
          importance: fact.importance,
          confidence: fact.confidence,
        });
      }
      return result.memories;
    }
  } catch (error) {
    console.error("Failed in memory extraction pipeline:", error);
  }

  return [];
}
