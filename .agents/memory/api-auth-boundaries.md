---
name: API authentication boundaries
description: Prevent Admin middleware from accidentally blocking public storefront endpoints.
---

Apply Admin authentication explicitly to each protected route handler. Never use unscoped authentication middleware in a router that shares a mount chain with public routes.

**Why:** Express middleware can continue into subsequently mounted routers. A router-level Admin guard once intercepted public catalogue reads, so the database and catalogue publish succeeded while the live storefront received 401 responses.

**How to apply:** Keep catalogue and category reads public, keep mutations and Admin data explicitly authenticated, and preserve the route-boundary build guard whenever API routes are added or reorganized.