import { integer, pgTable, real, timestamp } from "drizzle-orm/pg-core";

export const storeSettingsTable = pgTable("store_settings", {
  id: integer("id").primaryKey(),
  gbpPerEur: real("gbp_per_eur").notNull().default(0.86),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});