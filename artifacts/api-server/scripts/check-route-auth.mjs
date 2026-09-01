import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const products = await readFile(new URL("../src/routes/products.ts", import.meta.url), "utf8");
const adminAccess = await readFile(new URL("../src/routes/adminAccess.ts", import.meta.url), "utf8");

for (const [name, source] of [
  ["products", products],
  ["adminAccess", adminAccess],
]) {
  assert.doesNotMatch(
    source,
    /router\.use\(requireAdmin\)/,
    `${name} router must not apply Admin authentication globally`,
  );
}

for (const route of ["/products", "/categories"]) {
  assert.match(
    products,
    new RegExp(`router\\.get\\(\"${route}\"\\s*,\\s*async`),
    `${route} must remain a public read route`,
  );
}

for (const signature of [
  'router.get("/admin/summary", requireAdmin,',
  'router.post("/products", requireAdmin,',
  'router.patch("/products/:id", requireAdmin,',
  'router.delete("/products/:id", requireAdmin,',
  'router.post("/products/import", requireAdmin,',
  'router.get("/admin/access", requireAdmin,',
  'router.post("/admin/access", requireAdmin, requireOwner,',
  'router.delete("/admin/access/:email", requireAdmin, requireOwner,',
]) {
  assert.ok(
    products.includes(signature) || adminAccess.includes(signature),
    `Protected route is missing explicit authentication: ${signature}`,
  );
}

console.log("Route authentication boundaries are valid.");