---
name: Admin ownership bootstrap
description: Why the catalogue Admin uses a first-authenticated-user ownership claim.
---

The first authenticated account to reach a protected Admin endpoint claims the single store-owner slot. Authentication alone must never grant catalogue access to later accounts.

**Why:** The managed identity tenant starts without a known user ID or email allowlist. A persisted one-owner claim provides a usable bootstrap without making every account an administrator.

**How to apply:** Preserve the existing owner when changing sign-in providers or Admin middleware. Ownership transfer must be an explicit operation rather than a new sign-in automatically replacing the current owner.