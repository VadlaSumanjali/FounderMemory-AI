import { detectIntent, AgentRole, ToolType } from "./intent-detector";
import { executeTool } from "./tool-router";
import { buildContext } from "./context-builder";
import { recallMemories, RecalledMemory } from "../hindsight";
import { rankMemories } from "./memory-ranking";
import { buildPrompt } from "./prompt-builder";
import { getStreamingChatResponse, ChatMessage } from "../openai";
import { validateResponse } from "./response-validator";
import { extractAndStoreMemories } from "./memory-extractor";

export interface BrainPipelineResult {
  agent: AgentRole;
  toolExecuted: ToolType | null;
  toolOutput: string | null;
  recalledMemories: RecalledMemory[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stream: any; // OpenAI Chat Completion Stream
  onComplete: (fullAssistantText: string) => Promise<void>;
}

/**
 * Orchestrates the full AI Brain Pipeline for a user message.
 */
export async function processMessage(params: {
  query: string;
  startupId: string;
  conversationId?: string;
  history?: ChatMessage[];
}): Promise<BrainPipelineResult> {
  const { query, startupId, conversationId, history = [] } = params;

  // 1. Detect Intent (Agent persona, tool routing, search keywords)
  const historyText = history.map(h => `${h.role}: ${h.content}`).join("\n").substring(0, 1000);
  const intent = await detectIntent(query, historyText);

  let toolOutput: string | null = null;
  let toolExecuted: ToolType | null = null;

  // 2. Execute Tool (if one is detected)
  if (intent.tool) {
    try {
      const toolResult = await executeTool(intent.tool, query, startupId);
      toolOutput = toolResult.output;
      toolExecuted = toolResult.toolName;
    } catch (error) {
      console.error(`Error executing tool ${intent.tool}:`, error);
      toolOutput = `Error occurred executing tool: ${intent.tool}.`;
    }
  }

  // 3. Recall Memories from Hindsight and Rank
  // Use user query and extracted entities to do Hindsight lookup
  const searchTerms = [query, ...intent.entities].join(" ");
  const rawMemories = await recallMemories(startupId, searchTerms, 15);
  const rankedMemories = rankMemories(rawMemories, 8);

  // 4. Build Context from Database (tasks, documents, meetings, journals)
  const context = await buildContext(startupId);

  // 5. Construct Prompts
  const systemPrompt = buildPrompt({
    agent: intent.agent,
    context,
    rankedMemories,
  });

  // If a tool was executed, inject its result into the user prompt context
  let adjustedUserMessage = query;
  if (toolOutput) {
    adjustedUserMessage = `
[TOOL EXECUTION OUTPUT]
${toolOutput}

[USER QUESTION]
${query}
`;
  }

  // 6. Call OpenAI Streaming
  const stream = await getStreamingChatResponse(
    systemPrompt,
    adjustedUserMessage,
    history
  );

  // 7. Return pipeline package
  return {
    agent: intent.agent,
    toolExecuted,
    toolOutput,
    recalledMemories: rankedMemories,
    stream,
    onComplete: async (fullAssistantText: string) => {
      // Validate the response
      const validation = validateResponse(fullAssistantText);
      
      // Perform background memory extraction and storage
      await extractAndStoreMemories({
        startupId,
        userMessage: query,
        assistantResponse: validation.sanitizedContent,
        conversationId,
      });

      // Increment access frequency for recalled memories in database
      // (handled within recallMemories, but we can log updates here if needed)
    },
  };
}
