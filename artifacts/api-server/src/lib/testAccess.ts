import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";

export const TEST_ACCESS_COOKIE = "site_test_session";
export const TEST_ACCESS_TTL_SECONDS = 2 * 60 * 60;

function getSecret() {
  return process.env.SITE_TEST_PASSWORD || "";
}

function getSigningKey() {
  return process.env.SESSION_SECRET || "";
}

function sign(payload: string) {
  return createHmac("sha256", getSigningKey()).update(payload).digest("base64url");
}

function readCookie(req: Request) {
  const cookies = req.headers.cookie?.split(";") ?? [];
  const entry = cookies.find((cookie) => cookie.trim().startsWith(`${TEST_ACCESS_COOKIE}=`));
  return entry?.trim().slice(TEST_ACCESS_COOKIE.length + 1) || null;
}

export function isTestAccessConfigured() {
  return Boolean(getSecret() && getSigningKey());
}

export function isValidTestPassword(password: unknown) {
  if (!isTestAccessConfigured() || typeof password !== "string") return false;
  const expected = Buffer.from(getSecret());
  const received = Buffer.from(password);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export function createTestAccessCookie() {
  const expiresAt = Date.now() + TEST_ACCESS_TTL_SECONDS * 1000;
  const payload = `owner|${expiresAt}`;
  return `${Buffer.from(payload).toString("base64url")}.${sign(payload)}`;
}

export function hasValidTestAccess(req: Request) {
  if (!isTestAccessConfigured()) return false;
  const value = readCookie(req);
  if (!value) return false;

  const [encodedPayload, receivedSignature] = value.split(".");
  if (!encodedPayload || !receivedSignature) return false;

  try {
    const payload = Buffer.from(encodedPayload, "base64url").toString("utf8");
    const expectedSignature = sign(payload);
    const expected = Buffer.from(expectedSignature);
    const received = Buffer.from(receivedSignature);
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) return false;

    const [, expiresAt] = payload.split("|");
    return payload.startsWith("owner|") && Number(expiresAt) > Date.now();
  } catch {
    return false;
  }
}

export function setTestAccessCookie(res: Response) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${TEST_ACCESS_COOKIE}=${createTestAccessCookie()}; Max-Age=${TEST_ACCESS_TTL_SECONDS}; Path=/; HttpOnly; SameSite=Lax${secure}`,
  );
}

export function clearTestAccessCookie(res: Response) {
  res.setHeader(
    "Set-Cookie",
    `${TEST_ACCESS_COOKIE}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`,
  );
}