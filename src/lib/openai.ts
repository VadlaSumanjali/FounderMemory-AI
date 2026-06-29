import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Interface representing a standard message in the chat history.
 */
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Gets a streaming chat response from OpenAI.
 */
export async function getStreamingChatResponse(
  systemPrompt: string,
  userMessage: string,
  history: ChatMessage[],
  temperature = 0.3
) {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...history.map(msg => ({
      role: msg.role as "user" | "assistant" | "system",
      content: msg.content,
    })),
    { role: "user", content: userMessage },
  ];

  return openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    temperature,
    stream: true,
  });
}

/**
 * Executes a structured JSON query to OpenAI.
 * Uses response_format: { type: "json_object" } and returns typed output.
 */
export async function extractJSONResponse<T>(
  systemPrompt: string,
  userMessage: string,
  fallback: T
): Promise<T> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return fallback;
    return JSON.parse(content) as T;
  } catch (error) {
    console.error("OpenAI JSON extraction failed:", error);
    return fallback;
  }
}

/**
 * Helper to generate semantic vector embeddings.
 */
export async function getEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error("Failed to generate embedding:", error);
    return [];
  }
}
