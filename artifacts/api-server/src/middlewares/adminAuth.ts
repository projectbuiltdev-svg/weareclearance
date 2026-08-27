import { getAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";
import { db, adminUsersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  const auth = getAuth(req);
  if (!auth.userId) {
    res.status(401).json({ error: "Administrator sign-in required" });
    return;
  }

  let [owner] = await db.select().from(adminUsersTable).where(eq(adminUsersTable.slot, 1)).limit(1);
  if (!owner) {
    await db
      .insert(adminUsersTable)
      .values({ slot: 1, clerkUserId: auth.userId })
      .onConflictDoNothing();
    [owner] = await db.select().from(adminUsersTable).where(eq(adminUsersTable.slot, 1)).limit(1);
  }
  if (!owner || owner.clerkUserId !== auth.userId) {
    res.status(403).json({ error: "This account does not have administrator access" });
    return;
  }
  next();
}