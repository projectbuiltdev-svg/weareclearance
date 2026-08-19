import { and, asc, eq, ilike, sql } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  CreateProductBody,
  CreateProductResponse,
  DeleteProductParams,
  GetAdminSummaryResponse,
  ImportProductsBody,
  ImportProductsResponse,
  ListCategoriesResponse,
  ListProductsQueryParams,
  ListProductsResponse,
  UpdateProductBody,
  UpdateProductParams,
  UpdateProductResponse,
} from "@workspace/api-zod";
import { db, productsTable, type Product } from "@workspace/db";

const router: IRouter = Router();

const starterProducts = [
  ["Smart Steel Bottle", "Kitchen", 299, 499, "Everyday carry bottle with a spill-safe lid.", "Bestseller", true],
  ["Cloud Soft Towel Set", "Home", 449, 799, "Two plush, quick-dry towels for the everyday refresh.", "Save 44%", true],
  ["Mini Bluetooth Speaker", "Electronics", 699, 1299, "Pocket-size sound with a full, room-filling beat.", "Hot Deal", true],
  ["Cotton Oversized Tee", "Fashion", 399, 699, "Soft cotton staple in a relaxed all-day fit.", "Trending", false],
  ["Glass Storage Box", "Kitchen", 349, 599, "A tidy way to prep, pack, and stack your pantry.", "New", false],
  ["Glow Table Lamp", "Home", 799, 1499, "A warm little glow for reading corners and side tables.", "Limited", false],
] as const;
let seedPromise: Promise<void> | null = null;

function imageFor(label: string, color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800"><rect width="100%" height="100%" fill="${color}"/><circle cx="660" cy="140" r="180" fill="rgba(255,255,255,.22)"/><text x="60" y="390" font-family="Arial, sans-serif" font-size="54" font-weight="700" fill="#1d1d1d">${label}</text><text x="60" y="455" font-family="Arial, sans-serif" font-size="26" fill="#1d1d1d">Sasta Bazaar pick</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function slugify(name: string, suffix: number): string {
  const base = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "product";
  return `${base}-${suffix}`;
}

function toProduct(row: Product) {
  return {
    ...row,
    createdAt: row.createdAt,
    compareAtPrice: row.compareAtPrice ?? null,
    badge: row.badge ?? null,
  };
}

async function seedIfEmpty(): Promise<void> {
  if (seedPromise) return seedPromise;
  seedPromise = (async () => {
    const [existing] = await db.select({ id: productsTable.id }).from(productsTable).limit(1);
    if (existing) return;

    const palette = ["#f9d556", "#9edce8", "#ffb76b", "#d3b8f2", "#b9dfa0", "#ffcecf"];
    await db.insert(productsTable).values(
      starterProducts.map(([name, category, price, compareAtPrice, description, badge, featured], index) => ({
        name,
        slug: slugify(name, index + 1),
        category,
        price,
        compareAtPrice,
        description,
        badge,
        featured,
        inventory: 12 + index * 7,
        imageUrl: imageFor(name, palette[index] ?? "#f4dfb8"),
      })),
    );
  })();
  try {
    await seedPromise;
  } finally {
    seedPromise = null;
  }
}

router.get("/products", async (req, res): Promise<void> => {
  const query = ListProductsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  await seedIfEmpty();
  const conditions = [];
  if (query.data.category) conditions.push(eq(productsTable.category, query.data.category));
  if (query.data.featured) conditions.push(eq(productsTable.featured, true));
  if (query.data.search) {
    const term = `%${query.data.search}%`;
    conditions.push(sql`(${ilike(productsTable.name, term)} OR ${ilike(productsTable.description, term)})`);
  }

  const rows = await db.select().from(productsTable).where(conditions.length ? and(...conditions) : undefined).orderBy(asc(productsTable.id));
  res.json(ListProductsResponse.parse(rows.map(toProduct)));
});

router.get("/categories", async (_req, res): Promise<void> => {
  await seedIfEmpty();
  const rows = await db.selectDistinct({ category: productsTable.category }).from(productsTable).orderBy(asc(productsTable.category));
  res.json(ListCategoriesResponse.parse(rows.map((row) => row.category)));
});

router.get("/admin/summary", async (_req, res): Promise<void> => {
  await seedIfEmpty();
  const rows = await db.select().from(productsTable);
  const categories = new Set(rows.map((row) => row.category));
  res.json(
    GetAdminSummaryResponse.parse({
      totalProducts: rows.length,
      featuredProducts: rows.filter((row) => row.featured).length,
      lowStockProducts: rows.filter((row) => row.inventory < 10).length,
      categories: categories.size,
    }),
  );
});

router.post("/products", async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [product] = await db
    .insert(productsTable)
    .values({ ...parsed.data, slug: slugify(parsed.data.name, Date.now()) })
    .returning();
  res.status(201).json(CreateProductResponse.parse(toProduct(product)));
});

router.patch("/products/:id", async (req, res): Promise<void> => {
  const params = UpdateProductParams.safeParse(req.params);
  const body = UpdateProductBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [product] = await db.update(productsTable).set(body.data).where(eq(productsTable.id, params.data.id)).returning();
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(UpdateProductResponse.parse(toProduct(product)));
});

router.delete("/products/:id", async (req, res): Promise<void> => {
  const params = DeleteProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [product] = await db.delete(productsTable).where(eq(productsTable.id, params.data.id)).returning();
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.sendStatus(204);
});

router.post("/products/import", async (req, res): Promise<void> => {
  const parsed = ImportProductsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const stamp = Date.now();
  const products = await db
    .insert(productsTable)
    .values(parsed.data.products.map((product, index) => ({ ...product, slug: slugify(product.name, stamp + index) })))
    .returning();
  res.status(201).json(ImportProductsResponse.parse({ imported: products.length, products: products.map(toProduct) }));
});

export default router;