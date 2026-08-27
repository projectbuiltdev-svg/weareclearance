---
name: Clerk hydration boundary
description: Prevent a missing Clerk custom-domain DNS record from blocking hydration across otherwise public routes.
---

Do not mount Clerk around the entire application when the custom Clerk Frontend API hostname is not guaranteed to resolve. Keep Clerk initialization inside the routes that actively require Clerk.

**Why:** A failed Clerk bootstrap can prevent React hydration while leaving only the pre-rendered storefront HTML visible. This makes unrelated routes appear to load while their interactive UI and route-specific content never render.

**How to apply:** Until the Clerk custom-domain DNS and proxy flow are verified end to end, keep public storefront and alternative owner-authentication routes outside the Clerk provider boundary. Re-test hydration before expanding that boundary.