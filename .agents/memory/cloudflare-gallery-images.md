---
name: Cloudflare gallery image URLs
description: Routing constraint for App Storage images rendered by the Cloudflare storefront.
---

Use absolute production API URLs for App Storage gallery images shown by the Cloudflare storefront.

**Why:** Requests to the storefront domain under `/api/storage/objects/...` are handled by Cloudflare’s SPA fallback and return HTML with HTTP 200, not image bytes. The same path on the production Replit API domain returns the expected image content.

**How to apply:** When adding persistent gallery assets, build their public URLs from the production API origin and verify the response content type is an image rather than trusting HTTP status alone.