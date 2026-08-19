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
  {
    name: "Stainless Steel Water Bottle",
    category: "Accessories",
    price: 2.99,
    compareAtPrice: 4.99,
    description: "A durable everyday bottle with a leak-resistant lid.",
    badge: "Bestseller",
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Cotton Towel Set",
    category: "Bathroom",
    price: 4.99,
    compareAtPrice: 8.99,
    description: "Two soft, quick-dry towels for an easy bathroom refresh.",
    badge: "Save 44%",
    featured: true,
    imageUrl: "https://www.americanblanketcompany.com/cdn/shop/files/cotton-bathtowels-white-productthumbnail-2025_2000x.jpg?v=1749829306",
  },
  {
    name: "Portable Bluetooth Speaker",
    category: "Audio",
    price: 7.99,
    compareAtPrice: 12.99,
    description: "Compact wireless sound for kitchens, gardens, and weekends away.",
    badge: "Hot Deal",
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Relaxed Cotton T-Shirt",
    category: "Women's",
    price: 4.49,
    compareAtPrice: 6.99,
    description: "A soft cotton staple in an easy, relaxed fit.",
    badge: "Trending",
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Glass Food Storage Box",
    category: "Food Storage",
    price: 3.49,
    compareAtPrice: 5.99,
    description: "A simple glass container for prepping, packing, and storing.",
    badge: "New",
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Table Lamp",
    category: "For the Home",
    price: 8.99,
    compareAtPrice: 14.99,
    description: "A warm, compact lamp for bedside tables and reading corners.",
    badge: "Last Chance",
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
  },
] as const;
let seedPromise: Promise<void> | null = null;

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

    await db.insert(productsTable).values(
      starterProducts.map((product, index) => ({
        ...product,
        slug: slugify(product.name, index + 1),
        inventory: 12 + index * 7,
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