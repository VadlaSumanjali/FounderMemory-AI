import { prisma } from "../prisma";

export interface GraphNode {
  id: string;
  label: string;
  type:
    | "Startup"
    | "Founder"
    | "Decision"
    | "Task"
    | "Document"
    | "Meeting"
    | "Journal"
    | "Competitor"
    | "Investor"
    | "Goal";
}

export interface GraphLink {
  source: string;
  target: string;
  type: string; // e.g. "BUILDS", "HAS_TODO", "DISCUSSED_IN", "DECIDED", "INVESTS_IN"
}

export interface KnowledgeGraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

/**
 * Builds a dynamic entity-relationship Knowledge Graph for the startup.
 */
export async function buildKnowledgeGraph(startupId: string): Promise<KnowledgeGraphData> {
  const startup = await prisma.startup.findUnique({
    where: { id: startupId },
    include: {
      user: true,
      tasks: { take: 15 },
      documents: { take: 10 },
      meetings: { take: 5 },
      journals: { take: 5 },
      memories: { where: { category: "Decision" }, take: 15 },
    },
  });

  if (!startup) {
    return { nodes: [], links: [] };
  }

  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  // 1. Root Startup Node
  nodes.push({
    id: startup.id,
    label: startup.name,
    type: "Startup",
  });

  // 2. Founder Node
  nodes.push({
    id: startup.userId,
    label: startup.user.name || startup.user.email,
    type: "Founder",
  });
  links.push({
    source: startup.userId,
    target: startup.id,
    type: "FOUNDED",
  });

  // 3. Goals / Mission
  if (startup.goals) {
    const goalId = `${startup.id}_goals`;
    nodes.push({
      id: goalId,
      label: "Business Goals",
      type: "Goal",
    });
    links.push({
      source: startup.id,
      target: goalId,
      type: "PURSUES",
    });
  }

  // 4. Tasks Nodes & Links
  for (const task of startup.tasks) {
    nodes.push({
      id: task.id,
      label: task.title,
      type: "Task",
    });
    links.push({
      source: startup.id,
      target: task.id,
      type: task.status === "DONE" ? "COMPLETED_TODO" : "HAS_TODO",
    });
  }

  // 5. Documents Nodes & Links
  for (const doc of startup.documents) {
    nodes.push({
      id: doc.id,
      label: doc.name,
      type: "Document",
    });
    links.push({
      source: startup.id,
      target: doc.id,
      type: "HAS_DOC",
    });
  }

  // 6. Meetings Nodes & Links
  for (const meeting of startup.meetings) {
    nodes.push({
      id: meeting.id,
      label: meeting.title,
      type: "Meeting",
    });
    links.push({
      source: startup.id,
      target: meeting.id,
      type: "CONDUCTED",
    });
  }

  // 7. Journal Nodes & Links
  for (const journal of startup.journals) {
    nodes.push({
      id: journal.id,
      label: journal.title,
      type: "Journal",
    });
    links.push({
      source: startup.id,
      target: journal.id,
      type: "REFLECTS",
    });
  }

  // 8. Decisions (from Memories category="Decision") Nodes & Links
  for (const dec of startup.memories) {
    // Truncate decision text for graph label
    const label = dec.content.length > 30 ? dec.content.substring(0, 30) + "..." : dec.content;
    nodes.push({
      id: dec.id,
      label,
      type: "Decision",
    });
    links.push({
      source: startup.id,
      target: dec.id,
      type: "DECIDED",
    });

    // If decision relates to a task (check tags)
    if (dec.tags && dec.tags.length > 0) {
      for (const t of startup.tasks) {
        if (dec.tags.some(tag => t.title.toLowerCase().includes(tag.toLowerCase()))) {
          links.push({
            source: dec.id,
            target: t.id,
            type: "RESOLVES",
          });
        }
      }
    }
  }

  return { nodes, links };
}
