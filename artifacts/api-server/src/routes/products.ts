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
  {
    name: "Velvet Cushion Pair",
    category: "Bedroom",
    price: 5.99,
    compareAtPrice: 9.99,
    description: "Two soft-touch cushions to add an easy colour refresh.",
    badge: "Save 40%",
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Cloud Comfort Pillow",
    category: "Pillows",
    price: 3.99,
    compareAtPrice: 6.99,
    description: "A plump, comfortable pillow for a better night's sleep.",
    badge: "Bestseller",
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "King Duvet Cover Set",
    category: "Duvet Covers & Bed Sets",
    price: 9.99,
    compareAtPrice: 16.99,
    description: "A simple, washable duvet cover set in a neutral finish.",
    badge: "Hot Deal",
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Easy-Care Fitted Sheet",
    category: "Sheets",
    price: 4.99,
    compareAtPrice: 7.99,
    description: "Soft easy-care bedding with a secure elasticated edge.",
    badge: "New",
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Quick-Dry Bath Towel",
    category: "Towels",
    price: 4.49,
    compareAtPrice: 7.99,
    description: "A generously sized quick-dry towel for everyday use.",
    badge: "Save 44%",
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Cosy Fleece Bathrobe",
    category: "Bathrobes",
    price: 8.99,
    compareAtPrice: 14.99,
    description: "A warm fleece robe for slow mornings and cosy evenings.",
    badge: "Last Chance",
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1578898887932-dce23a595ad4?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Stackable Storage Basket",
    category: "Storage",
    price: 3.49,
    compareAtPrice: 5.99,
    description: "A practical basket for shelves, cupboards, and quick tidying.",
    badge: "Everyday Value",
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Non-Stick Frying Pan",
    category: "Cookware",
    price: 7.49,
    compareAtPrice: 11.99,
    description: "A versatile non-stick pan for quick family meals.",
    badge: "Hot Deal",
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Mini Electric Chopper",
    category: "Appliances",
    price: 9.99,
    compareAtPrice: 15.99,
    description: "Compact chopping power for herbs, onions, and sauces.",
    badge: "New",
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Stemless Glass Set",
    category: "Glassware & Drinkware",
    price: 5.49,
    compareAtPrice: 8.99,
    description: "Four modern glasses for everyday drinks and entertaining.",
    badge: "Save 39%",
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Bamboo Utensil Set",
    category: "Kitchen Accessories",
    price: 2.99,
    compareAtPrice: 4.99,
    description: "A handy set of lightweight bamboo tools for the kitchen.",
    badge: "Everyday Value",
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Scented Candle Trio",
    category: "Gifts for Her",
    price: 6.99,
    compareAtPrice: 10.99,
    description: "Three softly scented candles ready for gifting.",
    badge: "Gift Pick",
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Travel Grooming Kit",
    category: "Gifts for Him",
    price: 7.99,
    compareAtPrice: 12.99,
    description: "A compact grooming kit for weekends and travel.",
    badge: "Gift Pick",
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Reed Diffuser Gift Set",
    category: "Home Gifts",
    price: 8.49,
    compareAtPrice: 12.99,
    description: "A stylish home fragrance set for an easy thoughtful gift.",
    badge: "Bestseller",
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1602523961358-f9f03dd557db?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Build-Your-Day Gift Box",
    category: "Gift Sets",
    price: 9.49,
    compareAtPrice: 14.99,
    description: "A cheerful ready-to-wrap selection of small treats.",
    badge: "Limited",
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Multi-Surface Cleaning Spray",
    category: "Cleaning",
    price: 2.49,
    compareAtPrice: 3.99,
    description: "A fresh-scented everyday spray for hard surfaces.",
    badge: "Everyday Value",
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1585832770485-e68a5dbfad52?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Kitchen Roll 4 Pack",
    category: "Paper Products",
    price: 3.99,
    compareAtPrice: 5.49,
    description: "Absorbent kitchen roll for everyday spills and cleaning.",
    badge: "Multibuy",
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1584556812952-905ffd0c611a?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Strong Tie Bin Bags",
    category: "Bin Bags",
    price: 2.99,
    compareAtPrice: 4.49,
    description: "A pack of strong tie-top bags for household clear-outs.",
    badge: "Bulk Buy",
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Laundry Sorter Basket",
    category: "Household Essentials",
    price: 6.99,
    compareAtPrice: 10.99,
    description: "A lightweight sorter to keep laundry day organised.",
    badge: "Save 36%",
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Foldable Garden Chair",
    category: "Garden Furniture",
    price: 9.99,
    compareAtPrice: 16.99,
    description: "A handy foldaway chair for patios, picnics, and camping.",
    badge: "Last Chance",
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1598902108854-10e335adac99?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Garden Grow Pot Set",
    category: "Garden Accessories",
    price: 4.99,
    compareAtPrice: 7.99,
    description: "A simple set of pots for herbs, flowers, and seedlings.",
    badge: "New",
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Two-Person Festival Tent",
    category: "Camping & Outdoor",
    price: 9.99,
    compareAtPrice: 19.99,
    description: "A compact two-person tent for weekends outdoors.",
    badge: "Half Price",
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1504851149312-7a075b496cc7?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Everyday Cotton Socks 5 Pack",
    category: "Socks",
    price: 3.99,
    compareAtPrice: 6.99,
    description: "Five pairs of comfortable cotton-rich everyday socks.",
    badge: "Multibuy",
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1582966772680-860e372bb558?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Classic Men's Hoodie",
    category: "Men's",
    price: 8.99,
    compareAtPrice: 14.99,
    description: "A relaxed everyday hoodie with a soft brushed finish.",
    badge: "Trending",
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Fresh Fragrance Mist",
    category: "Fragrances",
    price: 5.99,
    compareAtPrice: 8.99,
    description: "A light, fresh fragrance mist for everyday use.",
    badge: "Gift Pick",
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Hand and Body Care Set",
    category: "Personal Care",
    price: 6.49,
    compareAtPrice: 9.99,
    description: "A gentle hand and body care set for a little daily luxury.",
    badge: "Save 35%",
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Rechargeable LED Torch",
    category: "Tools",
    price: 4.99,
    compareAtPrice: 7.99,
    description: "A bright rechargeable torch for home, car, and camping.",
    badge: "New",
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Soft Washable Runner Rug",
    category: "Rugs",
    price: 9.99,
    compareAtPrice: 16.99,
    description: "A soft, easy-care runner to add warmth to hallways and rooms.",
    badge: "New",
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&w=900&q=80",
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
    const existing = await db.select({ slug: productsTable.slug }).from(productsTable);
    const existingSlugs = new Set(existing.map((product) => product.slug));
    const missingProducts = starterProducts.filter((product, index) => !existingSlugs.has(slugify(product.name, index + 1)));
    if (missingProducts.length === 0) return;

    await db.insert(productsTable).values(
      missingProducts.map((product, index) => ({
        ...product,
        slug: slugify(product.name, starterProducts.indexOf(product) + 1),
        inventory: 12 + starterProducts.indexOf(product) * 7,
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