import assert from "node:assert/strict";
import { AddressInfo } from "node:net";
import test from "node:test";
import express, { Router } from "express";
import session from "express-session";
import { Store } from "express-rate-limit";
import { ServerConfig } from "./config/env.js";
import { createApp } from "./app.js";
import { asyncHandler } from "./middleware/async-handler.js";
import { createRateLimiter } from "./middleware/rate-limit.js";
import { requireAdmin, requireAuth } from "./middleware/auth.js";
import { destroySession, regenerateSession } from "./middleware/auth-session.js";
import { createCsrfToken } from "./middleware/csrf.js";

const origin = "http://localhost:5173";
const testConfig: ServerConfig = {
  nodeEnv: "test",
  production: false,
  port: 0,
  mongoUri: "mongodb://localhost/youthcare-test",
  sessionSecret: "test-session-secret-long-enough-for-tests",
  allowedOrigins: new Set([origin]),
  openAiModel: "test-model"
};

test("preflight, CSRF rejection and acceptance use the session token", async () => {
  await withServer(async (baseUrl) => {
    const preflight = await fetch(`${baseUrl}/api/mutate`, {
      method: "OPTIONS",
      headers: {
        Origin: origin,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "x-csrf-token"
      }
    });
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get("access-control-allow-origin"), origin);
    assert.equal(preflight.headers.get("access-control-allow-credentials"), "true");

    const tokenResponse = await fetch(`${baseUrl}/api/csrf-token`, { headers: { Origin: origin } });
    const { csrfToken } = await tokenResponse.json() as { csrfToken: string };
    const cookie = tokenResponse.headers.get("set-cookie")?.split(";")[0];
    assert.ok(cookie);
    assert.equal(tokenResponse.headers.get("cache-control"), "no-store");

    const missingToken = await fetch(`${baseUrl}/api/mutate`, {
      method: "POST",
      headers: { Origin: origin, Cookie: cookie!, "Content-Type": "application/json" },
      body: "{}"
    });
    assert.equal(missingToken.status, 403);
    assert.equal((await missingToken.json() as ApiErrorBody).error.code, "CSRF_TOKEN_INVALID");

    const accepted = await fetch(`${baseUrl}/api/mutate`, {
      method: "POST",
      headers: { Origin: origin, Cookie: cookie!, "X-CSRF-Token": csrfToken, "Content-Type": "application/json" },
      body: "{}"
    });
    assert.equal(accepted.status, 200);
    assert.deepEqual(await accepted.json(), { success: true });
  });
});

test("unexpected origins and malformed JSON return structured errors", async () => {
  await withServer(async (baseUrl) => {
    const apiResponse = await fetch(`${baseUrl}/api/ping`);
    assert.equal(apiResponse.headers.get("cache-control"), "private, no-store");

    const badOrigin = await fetch(`${baseUrl}/api/ping`, { headers: { Origin: "https://untrusted.example" } });
    assert.equal(badOrigin.status, 403);
    assert.equal((await badOrigin.json() as ApiErrorBody).error.code, "ORIGIN_NOT_ALLOWED");

    const malformedJson = await fetch(`${baseUrl}/api/mutate`, {
      method: "POST",
      headers: { Origin: origin, "Content-Type": "application/json" },
      body: "{"
    });
    assert.equal(malformedJson.status, 400);
    assert.equal((await malformedJson.json() as ApiErrorBody).error.code, "INVALID_JSON");
  });
});

test("async route failures return generic responses without internal details", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/fail`);
    const body = await response.json() as ApiErrorBody;

    assert.equal(response.status, 500);
    assert.equal(body.error.code, "INTERNAL_ERROR");
    assert.equal(body.error.message.includes("private test detail"), false);
    assert.ok(body.error.requestId);
  });
});

test("rate limit responds with 429 and Retry-After", async () => {
  await withServer(async (baseUrl) => {
    const first = await fetch(`${baseUrl}/api/limited`);
    const second = await fetch(`${baseUrl}/api/limited`);
    const third = await fetch(`${baseUrl}/api/limited`);

    assert.equal(first.status, 200);
    assert.equal(second.status, 200);
    assert.equal(third.status, 429);
    assert.ok(Number(third.headers.get("retry-after")) >= 1);
    assert.equal((await third.json() as ApiErrorBody).error.code, "RATE_LIMITED");
  });
});

test("authentication middleware distinguishes unauthenticated and non-admin users", async () => {
  await withServer(async (baseUrl) => {
    const anonymous = await fetch(`${baseUrl}/api/private`);
    assert.equal(anonymous.status, 401);

    const userResponse = await fetch(`${baseUrl}/api/test-user`);
    const cookie = userResponse.headers.get("set-cookie")?.split(";")[0];
    const nonAdmin = await fetch(`${baseUrl}/api/admin-only`, { headers: { Cookie: cookie! } });
    assert.equal(nonAdmin.status, 403);
  });
});

test("session regeneration, persistence, logout, and invalidation work with cookie auth", async () => {
  await withServer(async (baseUrl) => {
    const initialTokenResponse = await fetch(`${baseUrl}/api/csrf-token`, { headers: { Origin: origin } });
    const initialCookie = initialTokenResponse.headers.get("set-cookie")?.split(";")[0];
    const { csrfToken: initialToken } = await initialTokenResponse.json() as { csrfToken: string };

    const login = await fetch(`${baseUrl}/api/test-login`, {
      method: "POST",
      headers: { Origin: origin, Cookie: initialCookie!, "X-CSRF-Token": initialToken }
    });
    const sessionCookie = login.headers.get("set-cookie")?.split(";")[0];
    const { csrfToken } = await login.json() as { csrfToken: string };
    assert.ok(sessionCookie);
    assert.notEqual(sessionCookie, initialCookie);
    assert.equal((await fetch(`${baseUrl}/api/private`, { headers: { Cookie: sessionCookie! } })).status, 200);

    const logout = await fetch(`${baseUrl}/api/test-logout`, {
      method: "POST",
      headers: { Origin: origin, Cookie: sessionCookie!, "X-CSRF-Token": csrfToken }
    });
    assert.equal(logout.status, 200);
    assert.equal((await fetch(`${baseUrl}/api/private`, { headers: { Cookie: sessionCookie! } })).status, 401);
  });
});

test("production config requires valid explicit origins and a valid port", async () => {
  const { getServerConfig } = await import("./config/env.js");
  const baseEnv = {
    NODE_ENV: "production",
    PORT: "10000",
    MONGODB_URI: "mongodb+srv://test.invalid/db",
    SESSION_SECRET: "a-session-secret-with-more-than-32-characters"
  };

  assert.throws(() => getServerConfig(baseEnv), /CLIENT_URL is required/);
  assert.throws(() => getServerConfig({ ...baseEnv, CLIENT_URL: "*" }), /valid HTTP or HTTPS origin/);
  assert.throws(() => getServerConfig({ ...baseEnv, CLIENT_URL: "http://site.test" }), /HTTPS origin/);
  assert.throws(() => getServerConfig({ ...baseEnv, CLIENT_URL: "https://site.test/path" }), /origin only/);
  assert.throws(() => getServerConfig({ ...baseEnv, CLIENT_URL: "https://site.test", SESSION_SECRET: "replace-with-a-long-random-secret-at-least-32-characters" }), /SESSION_SECRET/);

  const config = getServerConfig({ ...baseEnv, CLIENT_URL: "https://site.test", ALLOWED_ORIGINS: "https://preview.site.test" });
  assert.deepEqual([...config.allowedOrigins], ["https://site.test", "https://preview.site.test"]);
});

test("production session cookie is secure, host-only, HttpOnly and SameSite=Lax", async () => {
  const productionConfig = { ...testConfig, production: true, allowedOrigins: new Set(["https://app.example.test"]) };
  const router = Router();
  router.get("/session", (req, res) => {
    req.session.userId = "synthetic-user";
    res.json({ success: true });
  });

  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/session`, {
      headers: { Origin: "https://app.example.test", "X-Forwarded-Proto": "https" }
    });
    const cookie = response.headers.get("set-cookie") || "";
    assert.match(cookie, /HttpOnly/i);
    assert.match(cookie, /Secure/i);
    assert.match(cookie, /SameSite=Lax/i);
    assert.doesNotMatch(cookie, /Domain=/i);
  }, productionConfig, router);
});

interface ApiErrorBody {
  error: { code: string; message: string; requestId?: string };
}

async function withServer(
  run: (baseUrl: string) => Promise<void>,
  config: ServerConfig = testConfig,
  router: Router = Router()
): Promise<void> {
  router.get("/ping", (_req, res) => res.json({ success: true }));
  router.post("/mutate", (_req, res) => res.json({ success: true }));
  router.get("/limited", createRateLimiter("test-limit", 2, 60_000, "test-rate-secret", createTestStore()), (_req, res) => res.json({ success: true }));
  router.get("/private", requireAuth, (_req, res) => res.json({ success: true }));
  router.get("/admin-only", requireAdmin, (_req, res) => res.json({ success: true }));
  router.get("/test-user", (req, res) => {
    req.session.userId = "synthetic-user";
    req.session.role = "user";
    res.json({ success: true });
  });
  router.post("/test-login", asyncHandler(async (req, res) => {
    await regenerateSession(req);
    req.session.userId = "synthetic-user";
    req.session.role = "user";
    req.session.csrfToken = createCsrfToken();
    res.json({ csrfToken: req.session.csrfToken });
  }));
  router.post("/test-logout", requireAuth, asyncHandler(async (req, res) => {
    await destroySession(req);
    res.json({ success: true });
  }));
  router.get("/fail", asyncHandler(async () => {
    throw new Error("private test detail");
  }));

  const app = createApp(config, new session.MemoryStore(), router);
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address() as AddressInfo;
  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

function createTestStore(): Store {
  let totalHits = 0;
  let resetTime = new Date(Date.now() + 60_000);
  return {
    init: () => { totalHits = 0; resetTime = new Date(Date.now() + 60_000); },
    increment: () => ({ totalHits: ++totalHits, resetTime }),
    decrement: () => { totalHits = Math.max(0, totalHits - 1); },
    resetKey: () => { totalHits = 0; },
    resetAll: () => { totalHits = 0; }
  };
}