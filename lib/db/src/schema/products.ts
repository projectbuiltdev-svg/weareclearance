import { boolean, integer, pgTable, real, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const productsTable = pgTable(
  "products",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    sku: text("sku"),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    shortDescription: text("short_description"),
    description: text("description").notNull(),
    category: text("category").notNull(),
    price: real("price").notNull(),
    compareAtPrice: real("compare_at_price"),
    imageUrl: text("image_url").notNull(),
    badge: text("badge"),
    featured: boolean("featured").notNull().default(false),
    inventory: integer("inventory").notNull().default(20),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("products_slug_unique").on(table.slug),
    uniqueIndex("products_sku_unique").on(table.sku),
  ],
);

export type Product = typeof productsTable.$inferSelect;