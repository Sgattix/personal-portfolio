import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cookieJar = vi.hoisted(() => new Map<string, string>());

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      cookieJar.has(name) ? { value: cookieJar.get(name) } : undefined,
    set: (name: string, value: string) => cookieJar.set(name, value),
    delete: (name: string) => cookieJar.delete(name),
  }),
}));

const COOKIE = "portfolio_admin_session";

async function loadAuth(env: Record<string, string | undefined>) {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
  return import("@/lib/admin-auth");
}

beforeEach(() => {
  cookieJar.clear();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe("password check", () => {
  it("accepts only the configured password", async () => {
    const auth = await loadAuth({ ADMIN_PASSWORD: "s3cret-pw" });

    expect(await auth.verifyAdminPassword("s3cret-pw")).toBe(true);
    expect(await auth.verifyAdminPassword("s3cret-p")).toBe(false);
    expect(await auth.verifyAdminPassword("")).toBe(false);
  });

  it("refuses every password in production when ADMIN_PASSWORD is unset", async () => {
    const auth = await loadAuth({
      NODE_ENV: "production",
      ADMIN_PASSWORD: "",
    });

    expect(await auth.verifyAdminPassword("admin")).toBe(false);
    expect(await auth.verifyAdminPassword("")).toBe(false);
  });

  it("falls back to 'admin' only outside production", async () => {
    const auth = await loadAuth({
      NODE_ENV: "development",
      ADMIN_PASSWORD: "",
    });

    expect(await auth.verifyAdminPassword("admin")).toBe(true);
  });
});

describe("sessions", () => {
  const env = { ADMIN_SECRET: "secret-a", ADMIN_PASSWORD: "pw" };

  it("accepts a session it issued", async () => {
    const auth = await loadAuth(env);
    await auth.setAdminSession();

    expect(await auth.isAdminAuthenticated()).toBe(true);
  });

  it("rejects no cookie, garbage and forged signatures", async () => {
    const auth = await loadAuth(env);

    expect(await auth.isAdminAuthenticated()).toBe(false);

    cookieJar.set(COOKIE, "garbage");
    expect(await auth.isAdminAuthenticated()).toBe(false);

    cookieJar.set(COOKIE, `${Date.now()}.${"0".repeat(64)}`);
    expect(await auth.isAdminAuthenticated()).toBe(false);
  });

  it("rejects a session signed with a different secret", async () => {
    const issuer = await loadAuth({ ...env, ADMIN_SECRET: "other-secret" });
    await issuer.setAdminSession();

    const auth = await loadAuth(env);
    expect(await auth.isAdminAuthenticated()).toBe(false);
  });

  it("expires sessions after 8 hours", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));
    const auth = await loadAuth(env);
    await auth.setAdminSession();

    vi.setSystemTime(new Date("2024-01-01T07:59:00Z"));
    expect(await auth.isAdminAuthenticated()).toBe(true);

    vi.setSystemTime(new Date("2024-01-01T08:01:00Z"));
    expect(await auth.isAdminAuthenticated()).toBe(false);
  });

  it("logout clears the session", async () => {
    const auth = await loadAuth(env);
    await auth.setAdminSession();
    await auth.clearAdminSession();

    expect(await auth.isAdminAuthenticated()).toBe(false);
  });

  it("treats every session as invalid in production without ADMIN_SECRET", async () => {
    const auth = await loadAuth({
      NODE_ENV: "production",
      ADMIN_SECRET: "",
    });
    cookieJar.set(COOKIE, `${Date.now()}.${"0".repeat(64)}`);

    expect(await auth.isAdminAuthenticated()).toBe(false);
  });
});
