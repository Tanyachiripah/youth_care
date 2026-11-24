import assert from "node:assert/strict";
import test from "node:test";
import { Request, Response } from "express";
import { ApiError } from "./api-error.js";
import { createCsrfToken, csrfProtection, getCsrfTokenFromRequest, hasTrustedOrigin, verifyCsrfToken } from "./csrf.js";

test("CSRF tokens are random, URL-safe, and compared exactly", () => {
  const first = createCsrfToken();
  const second = createCsrfToken();

  assert.match(first, /^[A-Za-z0-9_-]{43}$/);
  assert.notEqual(first, second);
  assert.equal(verifyCsrfToken(first, first), true);
  assert.equal(verifyCsrfToken(first, `${first}x`), false);
  assert.equal(verifyCsrfToken(undefined, first), false);
});

test("only exact configured origins are trusted", () => {
  const allowedOrigins = new Set(["https://youthcare.example"]);

  assert.equal(hasTrustedOrigin("https://youthcare.example", allowedOrigins), true);
  assert.equal(hasTrustedOrigin("https://youthcare.example.attacker.test", allowedOrigins), false);
  assert.equal(hasTrustedOrigin(undefined, allowedOrigins), false);
});

test("CSRF middleware rejects missing origin and token and accepts a valid pair", () => {
  const allowedOrigins = new Set(["http://localhost:5173"]);
  const token = createCsrfToken();

  assertCsrfFailure({ origin: undefined, token, sessionToken: token }, allowedOrigins, "ORIGIN_NOT_ALLOWED");
  assertCsrfFailure({ origin: "http://localhost:5173", token: undefined, sessionToken: token }, allowedOrigins, "CSRF_TOKEN_INVALID");

  let nextError: unknown;
  const handler = csrfProtection(allowedOrigins);
  handler(makeRequest({ origin: "http://localhost:5173", token, sessionToken: token }), {} as Response, (error) => {
    nextError = error;
  });
  assert.equal(nextError, undefined);
});

test("safe methods skip CSRF checks and token retrieval initializes the session", () => {
  const request = makeRequest({ method: "GET", origin: undefined, token: undefined, sessionToken: undefined });
  const token = getCsrfTokenFromRequest(request);
  assert.equal(request.session.csrfToken, token);

  let nextError: unknown;
  csrfProtection(new Set())(request, {} as Response, (error) => {
    nextError = error;
  });
  assert.equal(nextError, undefined);
});

function assertCsrfFailure(
  input: { origin?: string; token?: string; sessionToken?: string },
  allowedOrigins: ReadonlySet<string>,
  code: string
): void {
  let nextError: unknown;
  csrfProtection(allowedOrigins)(makeRequest(input), {} as Response, (error) => {
    nextError = error;
  });
  assert.ok(nextError instanceof ApiError);
  assert.equal((nextError as ApiError).code, code);
}

function makeRequest(input: {
  method?: string;
  origin?: string;
  token?: string;
  sessionToken?: string;
}): Request {
  const headers: Record<string, string | undefined> = {
    origin: input.origin,
    "x-csrf-token": input.token
  };
  return {
    method: input.method || "POST",
    get: (name: string) => headers[name.toLowerCase()],
    session: { csrfToken: input.sessionToken }
  } as unknown as Request;
}