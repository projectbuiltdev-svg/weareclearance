import { desc, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { db, productsTable, storeSettingsTable } from "@workspace/db";
import { getProductImage } from "../lib/productStorage";
import { requireAdmin } from "../middlewares/adminAuth";

type PublishState = "idle" | "preparing" | "pushed" | "deploying" | "live" | "failed";

type PublishStatus = {
  state: PublishState;
  message: string;
  updatedAt: string;
  lastPublishedAt?: string;
  commitSha?: string;
  runUrl?: string;
};

type GitHubRef = { object: { sha: string } };
type GitHubBlob = { sha: string };
type GitHubTree = { sha: string };
type GitHubCommit = { sha: string };
type WorkflowRun = {
  head_sha: string;
  status: string;
  conclusion: string | null;
  html_url: string;
};

const router: IRouter = Router();
const owner = process.env.GITHUB_OWNER || "projectbuiltdev-svg";
const repo = process.env.GITHUB_REPOSITORY_NAME || "weareclearance";
const branch = process.env.GITHUB_BRANCH || "main";
const snapshotPath = "artifacts/sasta-bazaar/src/data/published-catalogue.json";

let status: PublishStatus = {
  state: "idle",
  message: "Catalogue has not been published from this Admin session.",
  updatedAt: new Date().toISOString(),
};
let activePublish: Promise<void> | null = null;

function updateStatus(next: Partial<PublishStatus> & Pick<PublishStatus, "state" | "message">) {
  status = { ...status, ...next, updatedAt: new Date().toISOString() };
}

async function github<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = process.env.GITHUB_PAT;
  if (!token) throw new Error("GitHub publishing is not configured on the API server.");
  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...init.headers,
    },
    signal: AbortSignal.timeout(30_000),
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) as T & { message?: string } : {} as T & { message?: string };
  if (!response.ok) throw new Error(body.message || `GitHub request failed (${response.status}).`);
  return body;
}

async function createBlob(content: string, encoding: "utf-8" | "base64" = "utf-8") {
  return github<GitHubBlob>(`/repos/${owner}/${repo}/git/blobs`, {
    method: "POST",
    body: JSON.stringify({ content, encoding }),
  });
}

function imageExtension(contentType: string | undefined) {
  if (contentType === "image/png") return "png";
  if (contentType === "image/jpeg") return "jpg";
  return "webp";
}

async function publishCatalogue() {
  updateStatus({ state: "preparing", message: "Preparing the live catalogue snapshot…" });

  const [products, settingsRows, ref] = await Promise.all([
    db.select().from(productsTable).orderBy(desc(productsTable.id)),
    db.select().from(storeSettingsTable).where(eq(storeSettingsTable.id, 1)).limit(1),
    github<GitHubRef>(`/repos/${owner}/${repo}/git/ref/heads/${branch}`),
  ]);

  const imageEntries: Array<{ path: string; mode: "100644"; type: "blob"; sha: string }> = [];
  const snapshotProducts = [];

  for (const product of products) {
    let imageUrl = product.imageUrl;
    if (imageUrl.startsWith("/api/storage/objects/uploads/")) {
      const file = await getProductImage(imageUrl.replace(/^\/api\/storage/, ""));
      if (!file) throw new Error(`Uploaded image is missing for ${product.name}.`);
      const [[bytes], [metadata]] = await Promise.all([file.download(), file.getMetadata()]);
      const extension = imageExtension(String(metadata.contentType || ""));
      const imageName = (product.sku || product.slug).toLowerCase().replace(/[^a-z0-9-]/g, "-");
      const publicPath = `catalogue-images/${imageName}.${extension}`;
      const blob = await createBlob(bytes.toString("base64"), "base64");
      imageEntries.push({
        path: `artifacts/sasta-bazaar/public/${publicPath}`,
        mode: "100644",
        type: "blob",
        sha: blob.sha,
      });
      imageUrl = `/${publicPath}`;
    }

    snapshotProducts.push({
      id: product.id,
      sku: product.sku || `WAC-${product.id}`,
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription || product.description,
      longDescription: product.description,
      description: product.description,
      category: product.category,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      imageUrl,
      badge: product.badge,
      featured: product.featured,
      inventory: product.inventory,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    });
  }

  const snapshot = JSON.stringify({
    version: 1,
    publishedAt: new Date().toISOString(),
    settings: { gbpPerEur: settingsRows[0]?.gbpPerEur ?? 0.86 },
    products: snapshotProducts,
  }, null, 2) + "\n";
  const snapshotBlob = await createBlob(snapshot);
  const tree = await github<GitHubTree>(`/repos/${owner}/${repo}/git/trees`, {
    method: "POST",
    body: JSON.stringify({
      base_tree: ref.object.sha,
      tree: [
        { path: snapshotPath, mode: "100644", type: "blob", sha: snapshotBlob.sha },
        ...imageEntries,
      ],
    }),
  });
  const commit = await github<GitHubCommit>(`/repos/${owner}/${repo}/git/commits`, {
    method: "POST",
    body: JSON.stringify({
      message: `Publish catalogue (${products.length} products)`,
      tree: tree.sha,
      parents: [ref.object.sha],
    }),
  });
  await github(`/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha, force: false }),
  });

  updateStatus({
    state: "pushed",
    message: `${products.length} products pushed to GitHub. Waiting for Cloudflare…`,
    commitSha: commit.sha,
  });

  for (let attempt = 0; attempt < 60; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 10_000));
    const result = await github<{ workflow_runs: WorkflowRun[] }>(
      `/repos/${owner}/${repo}/actions/workflows/cloudflare-pages.yml/runs?head_sha=${commit.sha}&per_page=5`,
    );
    const run = result.workflow_runs.find((item) => item.head_sha === commit.sha);
    if (!run) continue;
    if (run.status !== "completed") {
      updateStatus({
        state: "deploying",
        message: "Cloudflare is building the new catalogue…",
        runUrl: run.html_url,
      });
      continue;
    }
    if (run.conclusion === "success") {
      const publishedAt = new Date().toISOString();
      updateStatus({
        state: "live",
        message: `${products.length} products are live on Cloudflare.`,
        runUrl: run.html_url,
        lastPublishedAt: publishedAt,
      });
      return;
    }
    throw new Error(`Cloudflare deployment ${run.conclusion || "failed"}.`);
  }
  throw new Error("Timed out while waiting for the Cloudflare deployment.");
}

router.get("/admin/publish-catalogue", requireAdmin, (_req, res) => {
  res.json(status);
});

router.post("/admin/publish-catalogue", requireAdmin, (_req, res) => {
  if (activePublish) {
    res.status(409).json({ ...status, error: "A catalogue publish is already running." });
    return;
  }

  activePublish = publishCatalogue()
    .catch((error) => {
      updateStatus({
        state: "failed",
        message: error instanceof Error ? error.message : "Catalogue publishing failed.",
      });
    })
    .finally(() => {
      activePublish = null;
    });

  res.status(202).json({
    state: "preparing",
    message: "Catalogue publishing started.",
    updatedAt: new Date().toISOString(),
  });
});

export default router;