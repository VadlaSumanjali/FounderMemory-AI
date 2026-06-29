import { extractJSONResponse } from "../openai";

export type AgentRole =
  | "CEO"
  | "CTO"
  | "Marketing"
  | "Sales"
  | "Finance"
  | "Operations"
  | "PM"
  | "Legal"
  | "Investor"
  | "Growth"
  | "UX"
  | "Architecture";

export type ToolType =
  | "createTask"
  | "updateStartup"
  | "searchMemories"
  | "searchDocuments"
  | "summarizeMeeting"
  | "generatePitch"
  | "generatePRD"
  | "generateUserStories"
  | "businessModelCanvas"
  | "competitorAnalysis"
  | "swotAnalysis"
  | "marketingStrategy"
  | "customerPersona"
  | "financialForecast"
  | "roadmapGenerator"
  | "riskAnalysis"
  | "fundingPreparation"
  | "pitchDeckReview"
  | "featurePrioritization"
  | "investorQA"
  | "startupHealthAnalysis";

export interface IntentResult {
  agent: AgentRole;
  tool: ToolType | null;
  entities: string[];
  explanation: string;
}

/**
 * Analyzes the user's query to detect the best agent, tool, and entity targets.
 */
export async function detectIntent(query: string, chatHistory: string = ""): Promise<IntentResult> {
  const systemPrompt = `
    You are the Intent Detector of the FounderMemory AI Startup Brain.
    Your job is to analyze the user's question and determine:
    1. The specialized agent best suited for the query:
       - "CEO": Business model, vision, partnerships, general startup operations.
       - "CTO": Coding, software architecture, technical design, database decisions.
       - "PM": PRDs, features, roadmap planning, user stories, user flows.
       - "Marketing": Brand, SEO, growth channels, campaign planning, copy.
       - "Sales": Customer acquisition, deals, conversion funnels.
       - "Finance": Forecasts, pricing, budgets, metrics, cash burn.
       - "Operations": Workflows, team organization, tasks, hiring.
       - "Legal": NDAs, incorporation, compliance, contracts.
       - "Investor": Pitching, fundraising, investor Q&A.
       - "Growth": Metrics, referral programs, viral loops.
       - "UX": User interfaces, Apple/Linear style designs, wireframing.
       - "Architecture": System block diagrams, databases, integrations.
       
    2. The appropriate helper tool to call (or null if it is a general chat):
       - "createTask": User wants to add a todo, set a deadline, or assign a task.
       - "updateStartup": User wants to revise pricing, mission, vision, tech stack, or customer info.
       - "searchMemories": User explicitly asks to search what we decided, past conversations, or history.
       - "searchDocuments": User asks to search files/documents.
       - "summarizeMeeting": User wants to parse a meeting uploader or transcript.
       - "generatePitch": User wants an investor pitch deck draft.
       - "generatePRD": User wants a Product Requirements Document.
       - "generateUserStories": User wants Agile/Scrum user stories.
       - "businessModelCanvas": User wants a full Business Model Canvas.
       - "competitorAnalysis": User wants a competitor review.
       - "swotAnalysis": User wants a SWOT Analysis table.
       - "marketingStrategy": User wants growth strategies.
       - "customerPersona": User wants customer profile descriptions.
       - "financialForecast": User wants revenue/forecast metrics.
       - "roadmapGenerator": User wants roadmap stages.
       - "riskAnalysis": User wants risk tables.
       - "fundingPreparation": User wants seed/Series A prep list.
       - "pitchDeckReview": User wants critique on their pitch deck.
       - "featurePrioritization": User wants RICE / priority matrix.
       - "investorQA": User wants preparation for investor questions.
       - "startupHealthAnalysis": User wants status update on their startup completion.

    3. Essential entity terms mentioned (e.g. competitors, products, pricing, investors, etc.) to query Hindsight memory.
    
    Return a valid JSON object matching the format:
    {
      "agent": "CEO" | "CTO" | ... (select one),
      "tool": "createTask" | "swotAnalysis" | ... | null,
      "entities": ["entity1", "entity2", ...],
      "explanation": "Brief explanation of routing rationale"
    }
  `;

  const userMessage = `
    User Query: "${query}"
    Recent Conversation context:
    ${chatHistory}
  `;

  const fallback: IntentResult = {
    agent: "CEO",
    tool: null,
    entities: [],
    explanation: "Fallback routing to general CEO agent.",
  };

  return extractJSONResponse<IntentResult>(systemPrompt, userMessage, fallback);
}
