import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, storeSettingsTable } from "@workspace/db";
import { requireAdmin } from "../middlewares/adminAuth";

const router: IRouter = Router();
const DEFAULT_GBP_PER_EUR = 0.86;
async function getSettings() {
  const [settings] = await db.select().from(storeSettingsTable).where(eq(storeSettingsTable.id, 1)).limit(1);
  if (settings) return settings;
  const [created] = await db
    .insert(storeSettingsTable)
    .values({ id: 1, gbpPerEur: DEFAULT_GBP_PER_EUR })
    .onConflictDoNothing()
    .returning();
  if (created) return created;
  const [existing] = await db.select().from(storeSettingsTable).where(eq(storeSettingsTable.id, 1)).limit(1);
  return existing;
}

router.get("/store-settings", async (_req, res): Promise<void> => {
  const settings = await getSettings();
  res.json({ gbpPerEur: settings?.gbpPerEur ?? DEFAULT_GBP_PER_EUR });
});

router.put("/admin/store-settings", requireAdmin, async (req, res): Promise<void> => {
  const gbpPerEur = req.body?.gbpPerEur;
  if (typeof gbpPerEur !== "number" || !Number.isFinite(gbpPerEur) || gbpPerEur <= 0 || gbpPerEur > 10) {
    res.status(400).json({ error: "gbpPerEur must be a number greater than 0 and no more than 10" });
    return;
  }
  const [settings] = await db
    .insert(storeSettingsTable)
    .values({ id: 1, gbpPerEur, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: storeSettingsTable.id,
      set: { gbpPerEur, updatedAt: new Date() },
    })
    .returning();
  res.json({ gbpPerEur: settings.gbpPerEur });
});

export default router;