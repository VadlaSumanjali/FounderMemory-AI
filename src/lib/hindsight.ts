import { HindsightClient } from "@vectorize-io/hindsight-client";
import { prisma } from "./prisma";
import { extractJSONResponse } from "./openai";

const hindsightApiKey = process.env.HINDSIGHT_API_KEY;

// Initialize the Hindsight client if API key is provided
let hindsightClient: HindsightClient | null = null;
if (hindsightApiKey) {
  try {
    hindsightClient = new HindsightClient({
      baseUrl: process.env.HINDSIGHT_API_URL || "https://api.hindsight.vectorize.io",
      apiKey: hindsightApiKey,
    });
  } catch (error) {
    console.error("Failed to initialize Hindsight Client:", error);
  }
}

/**
 * Ensures that a memory bank exists for the startup.
 */
export async function ensureMemoryBank(startupId: string, name: string): Promise<void> {
  const bankId = `startup_${startupId.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
  if (!hindsightClient) return;

  try {
    // Attempt to create the bank. If it already exists, the API handles it gracefully.
    await hindsightClient.createBank(bankId, {
      name: `Startup Bank for ${name}`,
      background: `Memory bank containing operational data, decisions, tech architecture, and conversations for startup: ${name}`,
    });
  } catch (error) {
    console.warn(`Hindsight createBank failed for bank ${bankId}:`, error);
  }
}

/**
 * Retains a new memory fact in the Hindsight memory bank.
 */
export async function retainMemory(params: {
  startupId: string;
  content: string;
  category: string;
  tags?: string[];
  conversationId?: string;
  source?: string;
  importance?: number;
  confidence?: number;
}): Promise<void> {
  const {
    startupId,
    content,
    category,
    tags = [],
    conversationId,
    source = "chat",
    importance = 5,
    confidence = 1.0,
  } = params;

  // 1. Persist to PostgreSQL database (source of truth & metadata store)
  try {
    await prisma.memory.create({
      data: {
        startupId,
        content,
        category,
        tags,
        conversationId,
        source,
        importance,
        confidence,
      },
    });
  } catch (error) {
    console.error("Failed to save memory to PostgreSQL database:", error);
  }

  // 2. Persist to Hindsight Vector Bank (if available)
  if (hindsightClient) {
    const bankId = `startup_${startupId.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
    try {
      await hindsightClient.retain(bankId, content, {
        metadata: {
          category,
          source,
          conversationId: conversationId || "",
        },
        tags,
      });
    } catch (error) {
      console.warn(`Hindsight retain failed for bank ${bankId}, using local DB:`, error);
    }
  }
}

/**
 * Interface representing a recalled memory item.
 */
export interface RecalledMemory {
  id: string;
  content: string;
  category: string;
  tags: string[];
  importance: number;
  confidence: number;
  embeddingScore: number;
  source: string;
  createdAt: Date;
}

/**
 * Recalls memories matching a query from the startup's bank.
 */
export async function recallMemories(
  startupId: string,
  query: string,
  limit = 10
): Promise<RecalledMemory[]> {
  const bankId = `startup_${startupId.replace(/[^a-zA-Z0-9_-]/g, "_")}`;

  // 1. Try to fetch from Hindsight Client first
  if (hindsightClient) {
    try {
      const response = await hindsightClient.recall(bankId, query);
 
      if (response && response.results && response.results.length > 0) {
        const recalledItems: RecalledMemory[] = [];
        const limitedResults = response.results.slice(0, limit);
 
        // Match Hindsight vector matches back to database records to get full metadata
        for (let i = 0; i < limitedResults.length; i++) {
          const result = limitedResults[i];
          
          // Find matching memory in PostgreSQL database (by matching content text)
          const dbMemory = await prisma.memory.findFirst({
            where: {
              startupId,
              content: result.text,
            },
          });

          // Compute an artificial embeddingScore based on index if not provided
          const embeddingScore = 1.0 - (i / response.results.length) * 0.8;

          if (dbMemory) {
            recalledItems.push({
              id: dbMemory.id,
              content: dbMemory.content,
              category: dbMemory.category,
              tags: dbMemory.tags,
              importance: dbMemory.importance,
              confidence: dbMemory.confidence,
              embeddingScore,
              source: dbMemory.source,
              createdAt: dbMemory.createdAt,
            });

            // Update lastUsed and frequency in background
            prisma.memory.update({
              where: { id: dbMemory.id },
              data: {
                frequency: { increment: 1 },
                lastUsed: new Date(),
              },
            }).catch(() => {});
          } else {
            // Fallback if db record wasn't found but Hindsight has it
            recalledItems.push({
              id: result.id,
              content: result.text,
              category: (result.metadata?.category as string) || "Startup",
              tags: result.tags || [],
              importance: 5,
              confidence: 1.0,
              embeddingScore,
              source: (result.metadata?.source as string) || "chat",
              createdAt: new Date(),
            });
          }
        }

        return recalledItems;
      }
    } catch (error) {
      console.warn("Hindsight recall failed, falling back to local LLM-based DB search:", error);
    }
  }

  // 2. Fallback: Local database semantic ranking using OpenAI
  try {
    const allDbMemories = await prisma.memory.findMany({
      where: { startupId },
      orderBy: { createdAt: "desc" },
      take: 50, // Grab recent 50 memories to filter
    });

    if (allDbMemories.length === 0) return [];

    // Format memories for OpenAI filter evaluation
    const memoryList = allDbMemories.map((m, idx) => ({
      index: idx,
      id: m.id,
      content: m.content,
    }));

    const systemPrompt = `
      You are the search engine for a founder's memory assistant.
      Given a user's question and a list of memories, identify which memories are relevant to answering the question.
      Return a JSON object containing an array of relevant memory indices and a similarity score (between 0.0 and 1.0) for each.
      Format:
      {
        "matches": [
          { "index": 0, "score": 0.95 },
          { "index": 2, "score": 0.65 }
        ]
      }
    `;

    const userMessage = `
      Question: "${query}"
      Memories:
      ${JSON.stringify(memoryList, null, 2)}
    `;

    const response = await extractJSONResponse<{ matches: { index: number; score: number }[] }>(
      systemPrompt,
      userMessage,
      { matches: [] }
    );

    const relevantMemories: RecalledMemory[] = [];
    if (response && response.matches) {
      // Sort matches by relevance score
      const sortedMatches = response.matches
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      for (const match of sortedMatches) {
        const memory = allDbMemories[match.index];
        if (memory) {
          relevantMemories.push({
            id: memory.id,
            content: memory.content,
            category: memory.category,
            tags: memory.tags,
            importance: memory.importance,
            confidence: memory.confidence,
            embeddingScore: match.score,
            source: memory.source,
            createdAt: memory.createdAt,
          });

          // Update metrics
          prisma.memory.update({
            where: { id: memory.id },
            data: {
              frequency: { increment: 1 },
              lastUsed: new Date(),
            },
          }).catch(() => {});
        }
      }
    }

    return relevantMemories;
  } catch (error) {
    console.error("Local recall fallback failed:", error);
    return [];
  }
}
