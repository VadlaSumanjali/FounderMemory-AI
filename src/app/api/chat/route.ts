import { NextRequest } from "next/server";
import { getOrCreateUserContext } from "@/lib/auth-helper";
import { processMessage } from "@/lib/brain/brain";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user and get active startup
    const { startupId } = await getOrCreateUserContext();

    const body = await req.json();
    const { message, conversationId, history = [] } = body;

    if (!message) {
      return new Response(JSON.stringify({ error: "Missing message query" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Fetch or create conversation
    let activeConversationId = conversationId;
    if (!activeConversationId) {
      const convo = await prisma.conversation.create({
        data: {
          startupId,
          title: message.substring(0, 40) + (message.length > 40 ? "..." : ""),
        },
      });
      activeConversationId = convo.id;
    } else {
      // Update convo timestamp
      await prisma.conversation.update({
        where: { id: activeConversationId },
        data: { updatedAt: new Date() },
      }).catch(() => {});
    }

    // 3. Save user message to database
    await prisma.message.create({
      data: {
        conversationId: activeConversationId,
        role: "user",
        content: message,
      },
    });

    // 4. Run AI Brain pipeline
    const brainResult = await processMessage({
      query: message,
      startupId,
      conversationId: activeConversationId,
      history,
    });

    // 5. Create streaming response
    const encoder = new TextEncoder();
    let fullAssistantText = "";

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of brainResult.stream) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) {
              fullAssistantText += text;
              controller.enqueue(encoder.encode(text));
            }
          }

          // Save assistant message to database
          await prisma.message.create({
            data: {
              conversationId: activeConversationId,
              role: "assistant",
              content: fullAssistantText,
            },
          });

          // Run background task: validate response and extract memories
          // Wrap in try-catch to avoid breaking the stream finish
          try {
            await brainResult.onComplete(fullAssistantText);
          } catch (extractionError) {
            console.error("Background memory extraction failed:", extractionError);
          }

          controller.close();
        } catch (streamError) {
          console.error("Streaming error in chat route:", streamError);
          controller.error(streamError);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Conversation-Id": activeConversationId,
        "X-Agent-Persona": brainResult.agent,
        "X-Tool-Executed": brainResult.toolExecuted || "none",
        "X-Memories-Recalled": String(brainResult.recalledMemories.length),
      },
    });
  } catch (error) {
    console.error("Error in chat route:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: msg }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
