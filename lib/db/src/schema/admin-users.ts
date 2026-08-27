import { integer, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

export const adminUsersTable = pgTable(
  "admin_users",
  {
    slot: integer("slot").primaryKey().default(1),
    clerkUserId: text("clerk_user_id").notNull(),
  },
  (table) => [uniqueIndex("admin_users_clerk_user_unique").on(table.clerkUserId)],
);