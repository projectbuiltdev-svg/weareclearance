import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const clientHtmlPath = path.join(projectRoot, "dist/public/index.html")
const serverEntryPath = path.join(projectRoot, "dist/server/entry-server.js")

const template = await readFile(clientHtmlPath, "utf8")
const { render } = await import(serverEntryPath)

if (!template.includes("<!--ssr-outlet-->")) {
  throw new Error("SSR outlet marker was not found in the client HTML")
}

const routes = [
  {
    path: "/",
    output: clientHtmlPath,
    title: "We Are Clearance | Premium Finds at Clearance Prices",
    description: "Discover affordable homeware, kitchen, gifts and everyday essentials at We Are Clearance. Premium-style finds at refreshingly accessible prices.",
    robots: "index, follow",
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
]

for (const route of routes) {
  const canonicalUrl = new URL(route.path, "https://weareclearance.com").href
  const routeHtml = template
    .replace(/<title>.*?<\/title>/, `<title>${route.title}</title>`)
    .replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${route.description}" />`)
    .replace(/<meta name="robots" content=".*?" \/>/, `<meta name="robots" content="${route.robots}" />`)
    .replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${canonicalUrl}" />`)
    .replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${canonicalUrl}" />`)
    .replace("<!--ssr-outlet-->", render(route.path))

  await mkdir(path.dirname(route.output), { recursive: true })
  await writeFile(route.output, routeHtml)
}