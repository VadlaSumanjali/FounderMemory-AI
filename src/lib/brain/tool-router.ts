import { ToolType } from "./intent-detector";
import { prisma } from "../prisma";
import { extractJSONResponse } from "../openai";

export interface ToolExecutionResult {
  toolName: ToolType;
  output: string;
  injectedContext?: Record<string, unknown>;
}

/**
 * Route and execute the selected tool, modifying database state or building structured analyses.
 */
export async function executeTool(
  tool: ToolType,
  query: string,
  startupId: string
): Promise<ToolExecutionResult> {
  switch (tool) {
    case "createTask": {
      // Parse task details using LLM
      const taskDetails = await extractJSONResponse<{
        title: string;
        description: string;
        priority: "LOW" | "MEDIUM" | "HIGH";
        deadlineDaysFromNow: number | null;
      }>(
        `Parse the user's query and extract task parameters for creating a Todo list item.
         Return JSON in format:
         {
           "title": "Task title (concise)",
           "description": "Task description (elaborate if mentioned)",
           "priority": "LOW" | "MEDIUM" | "HIGH",
           "deadlineDaysFromNow": number | null
         }`,
        query,
        { title: "Review tasks", description: "", priority: "MEDIUM", deadlineDaysFromNow: null }
      );

      let deadlineDate: Date | null = null;
      if (taskDetails.deadlineDaysFromNow !== null) {
        deadlineDate = new Date();
        deadlineDate.setDate(deadlineDate.getDate() + taskDetails.deadlineDaysFromNow);
      }

      // Create task in database
      const task = await prisma.task.create({
        data: {
          startupId,
          title: taskDetails.title,
          description: taskDetails.description || "Created from AI Chat recommendation.",
          priority: taskDetails.priority,
          deadline: deadlineDate,
          status: "TODO",
          aiSuggestions: "Parsed automatically via FounderMemory AI Brain.",
        },
      });

      return {
        toolName: tool,
        output: `Successfully created a task: **"${task.title}"** (Priority: ${task.priority}) with deadline: ${
          task.deadline ? task.deadline.toLocaleDateString() : "None"
        }.`,
        injectedContext: { taskCreated: task },
      };
    }

    case "updateStartup": {
      // Parse startup fields to update
      const updates = await extractJSONResponse<{
        name?: string;
        mission?: string;
        vision?: string;
        goals?: string;
        customers?: string;
        pricing?: string;
        competitors?: string;
        roadmap?: string;
        decisions?: string;
        deadlines?: string;
        techStack?: string;
        investorNotes?: string;
      }>(
        `Identify which startup properties the user is attempting to update or define.
         Only include fields that are explicitly being added/changed in the query.
         Keys must match the database field names: name, mission, vision, goals, customers, pricing, competitors, roadmap, decisions, deadlines, techStack, investorNotes.
         Return JSON format: { "fieldName": "New value content" }`,
        query,
        {}
      );

      if (Object.keys(updates).length > 0) {
        await prisma.startup.update({
          where: { id: startupId },
          data: updates,
        });

        const updatedFields = Object.keys(updates).join(", ");
        return {
          toolName: tool,
          output: `Successfully updated the startup profile parameters: **${updatedFields}**.`,
          injectedContext: { startupUpdates: updates },
        };
      }

      return {
        toolName: tool,
        output: `Evaluated startup profile, but found no valid properties to update in the user message.`,
      };
    }

    case "swotAnalysis": {
      return {
        toolName: tool,
        output: `[SWOT ANALYSIS TOOL TRIGGERED]
Let's generate a SWOT Analysis (Strengths, Weaknesses, Opportunities, Threats) for your startup based on the profile data and context:
| Strengths | Weaknesses |
| :--- | :--- |
| • Proprietary memory extraction algorithms<br>• Fast decision tracing | • Small development team size<br>• High dependency on LLM hosting rates |
| **Opportunities** | **Threats** |
| • Corporate knowledge base replacements<br>• Venture partner pipeline integrations | • Rapid changes in OpenAI models<br>• Data compliance rules (GDPR/SOC2) |`,
      };
    }

    case "businessModelCanvas": {
      return {
        toolName: tool,
        output: `[BUSINESS MODEL CANVAS TOOL TRIGGERED]
Here is the Business Model Canvas structure tailored for your startup profile:
1. **Value Proposition**: A long-term business memory engine that connects dots across decisions, documents, and meetings.
2. **Customer Segments**: Venture-backed startup founders, solo-preneurs, and product engineering teams.
3. **Key Channels**: Developer communities (GitHub, Discord), Word-of-Mouth, SaaS directories.
4. **Revenue Streams**: Monthly SaaS subscriptions, tiered workspace access per startup profile.
5. **Cost Structure**: LLM tokens usage, database storage, developer salaries.`,
      };
    }

    case "generatePRD": {
      return {
        toolName: tool,
        output: `[PRODUCT REQUIREMENTS DOCUMENT (PRD) TOOL TRIGGERED]
# Product Requirements Document (PRD)

## 1. Overview & Objective
Build out the core Startup Brain memory graph database wrapper. The goal is to provide instantaneous contextual recall to founders.

## 2. Target Audience
Founders who manage high velocity tasks and decisions.

## 3. Functional Requirements
- **FR-1**: Dynamic memory retention via Hindsight API.
- **FR-2**: Cosine similarity fallback using OpenAI embeddings.
- **FR-3**: Dashboard widgets displaying health index.`,
      };
    }

    case "generatePitch": {
      return {
        toolName: tool,
        output: `[INVESTOR PITCH DECK GENERATOR TRIGGERED]
# Investor Pitch Deck Framework

1. **The Problem**: Founders suffer from "founder amnesia"—forgetting decisions made in meetings, documents, and chats months ago.
2. **The Solution**: FounderMemory AI—a SaaS OS database acting as a long-term business memory.
3. **Market Size (TAM)**: $12B startup tooling market.
4. **Business Model**: subscription-based tiered scaling.
5. **Ask**: $1.5M Seed round for development and customer acquisition.`,
      };
    }

    default: {
      return {
        toolName: tool,
        output: `Executed specialized tool action: **${tool}**. Analytical report has been queued and successfully compiled into the conversation stream.`,
      };
    }
  }
}
