import { Router, type IRouter } from "express";
import { and, eq, ne } from "drizzle-orm";
import { db, adminAccessTable } from "@workspace/db";
import {
  MAX_ADDITIONAL_ADMINS,
  PRIMARY_OWNER_EMAIL,
  requireAdmin,
  requireOwner,
  type AdminAccessRecord,
} from "../middlewares/adminAuth";

const router: IRouter = Router();
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  return EMAIL_PATTERN.test(email) ? email : null;
}

async function getAccessResponse(access: AdminAccessRecord) {
  if (access.slot !== 1) {
    return {
      isOwner: false,
      ownerEmail: PRIMARY_OWNER_EMAIL,
      maxAdditionalAdmins: MAX_ADDITIONAL_ADMINS,
      admins: [],
    };
  }

  const rows = await db
    .select({ email: adminAccessTable.email, createdAt: adminAccessTable.createdAt })
    .from(adminAccessTable)
    .where(ne(adminAccessTable.slot, 1))
    .orderBy(adminAccessTable.createdAt);

  return {
    isOwner: true,
    ownerEmail: PRIMARY_OWNER_EMAIL,
    maxAdditionalAdmins: MAX_ADDITIONAL_ADMINS,
    admins: rows,
  };
}

router.use(requireAdmin);

router.get("/admin/access", async (_req, res): Promise<void> => {
  const access = res.locals.adminAccess as AdminAccessRecord;
  res.json(await getAccessResponse(access));
});

router.post("/admin/access", requireOwner, async (req, res): Promise<void> => {
  const email = normalizeEmail(req.body?.email);
  if (!email) {
    res.status(400).json({ error: "Enter a valid email address." });
    return;
  }
  if (email === PRIMARY_OWNER_EMAIL) {
    res.status(400).json({ error: "The primary owner already has Administrator access." });
    return;
  }

  const currentAccess = res.locals.adminAccess as AdminAccessRecord;
  for (let slot = 2; slot <= MAX_ADDITIONAL_ADMINS + 1; slot += 1) {
    const [created] = await db
      .insert(adminAccessTable)
      .values({ slot, email })
      .onConflictDoNothing()
      .returning();

    if (created) {
      res.status(201).json(await getAccessResponse(currentAccess));
      return;
    }

    const [existing] = await db
      .select({ email: adminAccessTable.email })
      .from(adminAccessTable)
      .where(eq(adminAccessTable.email, email))
      .limit(1);
    if (existing) {
      res.status(409).json({ error: "That email address already has Administrator access." });
      return;
    }
  }

  res.status(409).json({ error: `You can add up to ${MAX_ADDITIONAL_ADMINS} additional Administrators.` });
});

router.delete("/admin/access/:email", requireOwner, async (req, res): Promise<void> => {
  const email = normalizeEmail(req.params.email);
  if (!email || email === PRIMARY_OWNER_EMAIL) {
    res.status(400).json({ error: "The primary owner cannot be removed." });
    return;
  }

  const [removed] = await db
    .delete(adminAccessTable)
    .where(and(eq(adminAccessTable.email, email), ne(adminAccessTable.slot, 1)))
    .returning({ email: adminAccessTable.email });
  if (!removed) {
    res.status(404).json({ error: "That Administrator was not found." });
    return;
  }

  res.json(await getAccessResponse(res.locals.adminAccess as AdminAccessRecord));
});

export default router;