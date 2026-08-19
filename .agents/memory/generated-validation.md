---
name: Generated validation schemas
description: A compatibility constraint between OpenAPI code generation and the workspace's installed Zod version.
---

Use OpenAPI `number` with `minimum` constraints for numeric IDs, counts, inventory, and prices instead of `integer`; the current Orval/Zod combination emits `zod.int()`, which is unavailable in the installed Zod runtime.

**Why:** Code generation succeeds, but the generated library typecheck fails when an OpenAPI integer is present.

**How to apply:** When adding or changing API schemas, prefer numeric fields with explicit minimum bounds and rerun codegen before using generated hooks or validators.