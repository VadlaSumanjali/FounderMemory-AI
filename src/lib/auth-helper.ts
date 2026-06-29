import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export interface UserStartupContext {
  userId: string;
  dbUserId: string;
  startupId: string;
}

/**
 * Retrieves the current Clerk user and syncs them with the PostgreSQL database.
 * Automatically creates a default Startup workspace if the user has none.
 */
export async function getOrCreateUserContext(): Promise<UserStartupContext> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized access. Active session required.");
  }

  // 1. Check if user already exists in local PostgreSQL database
  let dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { startups: true },
  });

  // 2. If user does not exist locally, fetch full profile from Clerk and register
  if (!dbUser) {
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0]?.emailAddress || `${userId}@placeholder.com`;
    const name = clerkUser ? `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() : null;

    dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        email,
        name: name || "Founder",
      },
      include: { startups: true },
    });
  }

  // 3. Ensure the user has at least one active Startup workspace
  let activeStartup = dbUser.startups[0];

  if (!activeStartup) {
    activeStartup = await prisma.startup.create({
      data: {
        userId: dbUser.id,
        name: "My Stealth Startup",
        mission: "Define your company's mission in the Profile settings.",
        vision: "Define your company's vision in the Profile settings.",
        techStack: "Next.js 15, React 19, Prisma, PostgreSQL",
      },
    });
  }

  return {
    userId,
    dbUserId: dbUser.id,
    startupId: activeStartup.id,
  };
}
