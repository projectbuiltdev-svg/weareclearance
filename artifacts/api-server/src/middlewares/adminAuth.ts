import { clerkClient, getAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";
import { db, adminAccessTable } from "@workspace/db";
import { and, eq, isNull } from "drizzle-orm";
import { hasValidTestAccess } from "../lib/testAccess";

export const PRIMARY_OWNER_EMAIL = "support@weareclearance.com";
export const MAX_ADDITIONAL_ADMINS = 6;

export type AdminAccessRecord = {
  slot: number;
  email: string;
  clerkUserId: string | null;
};

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

async function getPrimaryEmail(clerkUserId: string): Promise<string | null> {
  const user = await clerkClient.users.getUser(clerkUserId);
  const email = user.primaryEmailAddress?.emailAddress;
  return email ? normalizeEmail(email) : null;
}

async function ensureOwnerAccess(): Promise<void> {
  await db
    .insert(adminAccessTable)
    .values({ slot: 1, email: PRIMARY_OWNER_EMAIL })
    .onConflictDoNothing();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (hasValidTestAccess(req)) {
    try {
      await ensureOwnerAccess();
      const [access] = await db
        .select()
        .from(adminAccessTable)
        .where(eq(adminAccessTable.email, PRIMARY_OWNER_EMAIL))
        .limit(1);
      if (!access) {
        res.status(503).json({ error: "Temporary Administrator access could not be verified." });
        return;
      }
      res.locals.adminAccess = access satisfies AdminAccessRecord;
      next();
    } catch (error) {
      req.log.error({ err: error }, "Could not verify temporary administrator access");
      res.status(503).json({ error: "Administrator access could not be verified. Please try again." });
    }
    return;
  }

  const auth = getAuth(req);
  if (!auth.userId) {
    res.status(401).json({ error: "Administrator sign-in required" });
    return;
  }

  try {
    const email = await getPrimaryEmail(auth.userId);
    if (!email) {
      res.status(403).json({ error: "Your Clerk account needs a verified primary email address before it can access Admin." });
      return;
    }

    await ensureOwnerAccess();
    let [access] = await db
      .select()
      .from(adminAccessTable)
      .where(eq(adminAccessTable.email, email))
      .limit(1);

    if (!access) {
      res.status(403).json({ error: "This email address has not been approved for administrator access." });
      return;
    }

    if (access.clerkUserId && access.clerkUserId !== auth.userId) {
      res.status(403).json({ error: "This email address is already linked to a different Administrator account." });
      return;
    }

    if (!access.clerkUserId) {
      await db
        .update(adminAccessTable)
        .set({ clerkUserId: auth.userId })
        .where(and(eq(adminAccessTable.email, email), isNull(adminAccessTable.clerkUserId)));
      [access] = await db
        .select()
        .from(adminAccessTable)
        .where(eq(adminAccessTable.email, email))
        .limit(1);
    }

    if (!access || access.clerkUserId !== auth.userId) {
      res.status(403).json({ error: "This email address could not be linked to this Administrator account." });
      return;
    }

    res.locals.adminAccess = access satisfies AdminAccessRecord;
    next();
  } catch (error) {
    req.log.error({ err: error }, "Could not verify administrator access");
    res.status(503).json({ error: "Administrator access could not be verified. Please try again." });
  }
}

export function requireOwner(_req: Request, res: Response, next: NextFunction): void {
  const access = res.locals.adminAccess as AdminAccessRecord | undefined;
  if (!access || access.slot !== 1) {
    res.status(403).json({ error: "Only the primary owner can manage Administrator access." });
    return;
  }
  next();
}