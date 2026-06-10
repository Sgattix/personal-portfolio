import crypto from "node:crypto";

import { cookies } from "next/headers";

const ADMIN_COOKIE_NAME = "portfolio_admin_session";
const ADMIN_SESSION_TTL_MS = 1000 * 60 * 60 * 8;

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "admin";
}

function getAdminSecret(): string {
  return process.env.ADMIN_SECRET ?? "portfolio-admin-dev-secret";
}

function createSignature(value: string): string {
  return crypto
    .createHmac("sha256", getAdminSecret())
    .update(value)
    .digest("hex");
}

function createSessionToken(): string {
  const issuedAt = Date.now().toString();
  return `${issuedAt}.${createSignature(issuedAt)}`;
}

function verifySessionToken(token: string): boolean {
  const [issuedAt, signature] = token.split(".");

  if (!issuedAt || !signature) {
    return false;
  }

  const issuedAtNumber = Number(issuedAt);

  if (!Number.isFinite(issuedAtNumber)) {
    return false;
  }

  const age = Date.now() - issuedAtNumber;

  if (age < 0 || age > ADMIN_SESSION_TTL_MS) {
    return false;
  }

  const expectedSignature = createSignature(issuedAt);

  if (signature.length !== expectedSignature.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  return password === getAdminPassword();
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  return token ? verifySessionToken(token) : false;
}

export async function requireAdminSession(): Promise<boolean> {
  return isAdminAuthenticated();
}

export async function setAdminSession(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_TTL_MS / 1000,
  });
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(ADMIN_COOKIE_NAME);
}
