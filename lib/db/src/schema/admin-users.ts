import { integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const adminUsersTable = pgTable(
  "admin_users",
  {
    slot: integer("slot").primaryKey().default(1),
    clerkUserId: text("clerk_user_id").notNull(),
  },
  (table) => [uniqueIndex("admin_users_clerk_user_unique").on(table.clerkUserId)],
);

export const adminAccessTable = pgTable(
  "admin_access",
  {
    // Slot 1 is permanently reserved for the owner. Slots 2-7 allow six
    // additional Admin accounts and enforce the access limit at the database level.
    slot: integer("slot").primaryKey(),
    email: text("email").notNull(),
    clerkUserId: text("clerk_user_id"),
    clerkInvitationId: text("clerk_invitation_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("admin_access_email_unique").on(table.email),
    uniqueIndex("admin_access_clerk_user_unique").on(table.clerkUserId),
  ],
);