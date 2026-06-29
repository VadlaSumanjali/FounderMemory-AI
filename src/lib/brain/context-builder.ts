import { prisma } from "../prisma";

export interface StartupContext {
  profile: {
    name: string;
    mission: string;
    vision: string;
    goals: string;
    customers: string;
    pricing: string;
    competitors: string;
    roadmap: string;
    decisions: string;
    deadlines: string;
    techStack: string;
    investorNotes: string;
  };
  tasks: Array<{
    title: string;
    description: string | null;
    priority: string;
    status: string;
    deadline: string | null;
  }>;
  documents: Array<{
    name: string;
    type: string;
    content: string;
  }>;
  meetings: Array<{
    title: string;
    date: string;
    summary: string | null;
    actionItems: unknown;
  }>;
  journals: Array<{
    title: string;
    date: string;
    content: string;
    mood: string | null;
  }>;
}

/**
 * Gathers all database context entities associated with a startup.
 */
export async function buildContext(startupId: string): Promise<StartupContext> {
  const startup = await prisma.startup.findUnique({
    where: { id: startupId },
    include: {
      tasks: {
        where: { status: { in: ["TODO", "IN_PROGRESS"] } },
        orderBy: { updatedAt: "desc" },
        take: 10,
      },
      documents: {
        orderBy: { updatedAt: "desc" },
        take: 5,
      },
      meetings: {
        orderBy: { date: "desc" },
        take: 3,
      },
      journals: {
        orderBy: { date: "desc" },
        take: 3,
      },
    },
  });

  if (!startup) {
    throw new Error(`Startup not found with ID: ${startupId}`);
  }

  return {
    profile: {
      name: startup.name,
      mission: startup.mission || "Not defined yet.",
      vision: startup.vision || "Not defined yet.",
      goals: startup.goals || "Not defined yet.",
      customers: startup.customers || "Not defined yet.",
      pricing: startup.pricing || "Not defined yet.",
      competitors: startup.competitors || "Not defined yet.",
      roadmap: startup.roadmap || "Not defined yet.",
      decisions: startup.decisions || "Not defined yet.",
      deadlines: startup.deadlines || "Not defined yet.",
      techStack: startup.techStack || "Not defined yet.",
      investorNotes: startup.investorNotes || "Not defined yet.",
    },
    tasks: startup.tasks.map(t => ({
      title: t.title,
      description: t.description,
      priority: t.priority,
      status: t.status,
      deadline: t.deadline ? t.deadline.toLocaleDateString() : null,
    })),
    documents: startup.documents.map(d => ({
      name: d.name,
      type: d.type,
      // Truncate document content to avoid token bloating
      content: d.content.substring(0, 1500) + (d.content.length > 1500 ? "..." : ""),
    })),
    meetings: startup.meetings.map(m => ({
      title: m.title,
      date: m.date.toLocaleDateString(),
      summary: m.summary,
      actionItems: m.actionItems,
    })),
    journals: startup.journals.map(j => ({
      title: j.title,
      date: j.date.toLocaleDateString(),
      content: j.content,
      mood: j.mood,
    })),
  };
}
