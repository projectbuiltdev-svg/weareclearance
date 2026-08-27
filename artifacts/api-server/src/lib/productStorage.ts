import { randomUUID } from "crypto";
import { Readable } from "stream";
import { type File, Storage } from "@google-cloud/storage";

const SIDECAR = "http://127.0.0.1:1106";

const storage = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${SIDECAR}/token`,
    type: "external_account",
    credential_source: {
      url: `${SIDECAR}/credential`,
      format: { type: "json", subject_token_field_name: "access_token" },
    },
    universe_domain: "googleapis.com",
  },
  projectId: "",
});

function privateDir(): string {
  const value = process.env.PRIVATE_OBJECT_DIR;
  if (!value) throw new Error("PRIVATE_OBJECT_DIR is not configured");
  return value.replace(/\/$/, "");
}

function parsePath(path: string) {
  const parts = path.replace(/^\//, "").split("/");
  if (parts.length < 2) throw new Error("Invalid object path");
  return { bucketName: parts[0], objectName: parts.slice(1).join("/") };
}

async function signedPutUrl(bucketName: string, objectName: string): Promise<string> {
  const response = await fetch(`${SIDECAR}/object-storage/signed-object-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bucket_name: bucketName,
      object_name: objectName,
      method: "PUT",
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`Could not create upload URL (${response.status})`);
  const body = (await response.json()) as { signed_url: string };
  return body.signed_url;
}

export async function createProductImageUpload() {
  const objectPath = `/objects/uploads/${randomUUID()}`;
  const { bucketName, objectName } = parsePath(`${privateDir()}/${objectPath.replace(/^\/objects\//, "")}`);
  return { uploadURL: await signedPutUrl(bucketName, objectName), objectPath };
}

export async function getProductImage(objectPath: string): Promise<File | null> {
  if (!objectPath.startsWith("/objects/uploads/")) return null;
  const { bucketName, objectName } = parsePath(`${privateDir()}/${objectPath.replace(/^\/objects\//, "")}`);
  const file = storage.bucket(bucketName).file(objectName);
  const [exists] = await file.exists();
  return exists ? file : null;
}

export async function streamProductImage(file: File, res: import("express").Response): Promise<void> {
  const [metadata] = await file.getMetadata();
  res.setHeader("Content-Type", String(metadata.contentType || "image/webp"));
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  if (metadata.size) res.setHeader("Content-Length", String(metadata.size));
  Readable.from(file.createReadStream()).pipe(res);
}