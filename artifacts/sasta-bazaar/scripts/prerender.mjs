import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const clientHtmlPath = path.join(projectRoot, "dist/public/index.html")
const serverEntryPath = path.join(projectRoot, "dist/server/entry-server.js")
const staticProductsPath = path.join(projectRoot, "src/data/static-products.ts")
const publishedCataloguePath = path.join(projectRoot, "src/data/published-catalogue.json")

const template = await readFile(clientHtmlPath, "utf8")
const { render } = await import(serverEntryPath)
const staticProductsSource = await readFile(staticProductsPath, "utf8")
const publishedCatalogue = JSON.parse(await readFile(publishedCataloguePath, "utf8"))
const legacyArrayMarker = "const legacyStaticProducts = ["
const productArrayStart = staticProductsSource.indexOf(legacyArrayMarker) + legacyArrayMarker.length - 1
const productArrayEnd = staticProductsSource.indexOf("\n]\n\nconst normalizedLegacyProducts") + 2
const legacyProductMetadata = JSON.parse(staticProductsSource.slice(productArrayStart, productArrayEnd))
const publishedKeys = new Set(publishedCatalogue.products.map((product) => product.sku || product.slug))
const productMetadata = [
  ...publishedCatalogue.products,
  ...legacyProductMetadata.filter((product) => !publishedKeys.has(product.sku || product.slug)),
]

const faqItems = [
  ["What products does We Are Clearance sell?", "We Are Clearance sells clearance homeware, kitchen and dining essentials, affordable gifts, accessories and everyday household products."],
  ["Do you deliver across the UK and Ireland?", "Yes. We Are Clearance serves customers across the United Kingdom and Ireland, with delivery information confirmed during checkout."],
  ["Are the original and sale prices shown clearly?", "Yes. Discounted products show the current sale price beside the struck-through original price, along with the calculated percentage saving."],
  ["Can clearance products sell out?", "Yes. Clearance quantities are limited and product pages display current stock availability, so popular items may sell out quickly."],
]

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map(([name, text]) => ({
    "@type": "Question",
    name,
    acceptedAnswer: { "@type": "Answer", text },
  })),
}

if (!template.includes("<!--ssr-outlet-->")) {
  throw new Error("SSR outlet marker was not found in the client HTML")
}

const routes = [
  {
    path: "/",
    output: clientHtmlPath,
    title: "Clearance Homeware, Gifts & Everyday Deals | We Are Clearance",
    description: "Shop clearance homeware, kitchen essentials, affordable gifts and everyday deals at We Are Clearance, with delivery across the UK and Ireland.",
    robots: "index, follow",
    structuredData: [faqSchema],
  },
  {
    path: "/checkout",
    output: path.join(projectRoot, "dist/public/checkout/index.html"),
    title: "Secure Checkout | We Are Clearance",
    description: "Review your We Are Clearance basket and complete the demo checkout securely.",
    robots: "noindex, nofollow",
  },
  {
    path: "/admin",
    output: path.join(projectRoot, "dist/public/admin/index.html"),
    title: "Store Administration | We Are Clearance",
    description: "Manage the We Are Clearance product catalogue.",
    robots: "noindex, nofollow",
  },
  ...[
    ["deals", "Clearance Deals Under £10", "Shop clearance deals under £10 across homeware, kitchen, gifts and everyday essentials at We Are Clearance."],
    ["home-living", "Clearance Homeware & Home Essentials", "Shop clearance homeware, bedroom, bathroom, storage and household essentials for less at We Are Clearance."],
    ["kitchen-dining", "Clearance Kitchen & Dining", "Save on clearance cookware, kitchen appliances, food storage, glassware and dining essentials at We Are Clearance."],
    ["gifts", "Affordable Clearance Gifts", "Discover affordable clearance gifts, gift sets and thoughtful present ideas for her, him and the home."],
    ["last-chance", "Last Chance Clearance Deals", "Shop final reductions and last chance clearance deals before limited stock sells out at We Are Clearance."],
  ].map(([slug, name, description]) => ({
    path: `/collections/${slug}`,
    output: path.join(projectRoot, `dist/public/collections/${slug}/index.html`),
    title: `${name} | We Are Clearance`,
    description,
    robots: "index, follow",
  })),
  ...productMetadata.map((product) => {
    const productUrl = `https://weareclearance.com/products/${product.slug}`
    const productSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": `${productUrl}#product`,
      name: product.name,
      description: product.description,
      image: [product.imageUrl],
      sku: product.sku,
      category: product.category,
      brand: { "@type": "Brand", name: "We Are Clearance" },
      offers: {
        "@type": "Offer",
        url: productUrl,
        priceCurrency: "EUR",
        price: product.price.toFixed(2),
        availability: product.inventory > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@id": "https://weareclearance.com/#organization" },
      },
    }
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://weareclearance.com/" },
        { "@type": "ListItem", position: 2, name: product.category },
        { "@type": "ListItem", position: 3, name: product.name, item: productUrl },
      ],
    }
    return {
      path: `/products/${product.slug}`,
      output: path.join(projectRoot, `dist/public/products/${product.slug}/index.html`),
      title: `${product.name} Clearance Deal | We Are Clearance`,
      description: `${product.description} Shop this ${product.category.toLowerCase()} clearance deal at We Are Clearance while stock lasts.`.slice(0, 160),
      robots: "index, follow",
      image: product.imageUrl,
      ogType: "product",
      structuredData: [productSchema, breadcrumbSchema],
    }
  }),
]

for (const route of routes) {
  const canonicalUrl = new URL(route.path, "https://weareclearance.com").href
  const structuredData = (route.structuredData ?? [])
    .map((data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`)
    .join("")
  const routeHtml = template
    .replace(/<title>.*?<\/title>/, `<title>${route.title}</title>`)
    .replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${route.description}" />`)
    .replace(/<meta name="robots" content=".*?" \/>/, `<meta name="robots" content="${route.robots}" />`)
    .replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${canonicalUrl}" />`)
    .replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${canonicalUrl}" />`)
    .replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${route.title}" />`)
    .replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${route.description}" />`)
    .replace(/<meta property="og:type" content=".*?" \/>/, `<meta property="og:type" content="${route.ogType ?? "website"}" />`)
    .replace(/<meta property="og:image" content=".*?" \/>/, `<meta property="og:image" content="${route.image ?? "https://weareclearance.com/we-are-clearance-og.jpg"}" />`)
    .replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${route.title}" />`)
    .replace(/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${route.description}" />`)
    .replace(/<meta name="twitter:image" content=".*?" \/>/, `<meta name="twitter:image" content="${route.image ?? "https://weareclearance.com/we-are-clearance-og.jpg"}" />`)
    .replace("</head>", `${structuredData}</head>`)
    .replace("<!--ssr-outlet-->", render(route.path))

  await mkdir(path.dirname(route.output), { recursive: true })
  await writeFile(route.output, routeHtml)
}

const productSitemapEntries = productMetadata
  .map(({ slug }) => `  <url><loc>https://weareclearance.com/products/${slug}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`)
  .join("\n")
const sitemapPath = path.join(projectRoot, "dist/public/sitemap.xml")
const sitemap = await readFile(sitemapPath, "utf8")
await writeFile(sitemapPath, sitemap.replace("</urlset>", `${productSitemapEntries}\n</urlset>`))