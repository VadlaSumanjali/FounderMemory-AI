/* eslint-disable @typescript-eslint/no-explicit-any */
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Match all dashboard pages and API route endpoints
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/chat(.*)",
  "/memory(.*)",
  "/startup(.*)",
  "/documents(.*)",
  "/meetings(.*)",
  "/tasks(.*)",
  "/journal(.*)",
  "/analytics(.*)",
  "/settings(.*)",
  "/account(.*)",
  "/api/chat(.*)",
  "/api/startup(.*)",
  "/api/tasks(.*)",
  "/api/meetings(.*)",
  "/api/documents(.*)",
  "/api/journal(.*)",
  "/api/graph(.*)",
  "/api/conversations(.*)",
]);

export default clerkMiddleware(async (auth: any, req: any) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Exclude static assets and Next.js internals
    "/((?!_next|[^?]*\\.(?:html|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API and TRPC routes
    "/(api|trpc)(.*)",
  ],
};
