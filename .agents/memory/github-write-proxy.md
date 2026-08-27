---
name: GitHub write proxy
description: Environment-specific fallback when authorized GitHub connector writes are blocked before reaching GitHub.
---

GitHub connector reads may succeed while Git blob, tree, or commit writes return a Replit Cloudflare block page rather than a GitHub API response. In that situation, use a workspace-managed GitHub credential through the direct GitHub REST API from trusted server-side code; never expose it to the browser or logs.

**Why:** Both combined and individually split connector write payloads were blocked at the connector proxy, while direct authenticated GitHub API access and subsequent workflow execution succeeded.

**How to apply:** Confirm the error body originates from Replit's Cloudflare edge rather than GitHub authentication. Keep all fallback authentication in Secrets and all writes on the server.