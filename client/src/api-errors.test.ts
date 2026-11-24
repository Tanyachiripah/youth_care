/// <reference types="node" />

import assert from "node:assert/strict";
import test from "node:test";
import { getApiErrorMessage } from "./api-errors";

test("API errors map auth, permission, rate limit, and server statuses to clear messages", () => {
  assert.equal(getApiErrorMessage({ response: { status: 401 } }, "fallback"), "Your session has expired. Please sign in again.");
  assert.equal(getApiErrorMessage({ response: { status: 403 } }, "fallback"), "You do not have permission to perform this action.");
  assert.equal(getApiErrorMessage({ response: { status: 429 } }, "fallback"), "Too many requests. Please wait a moment and try again.");
  assert.equal(getApiErrorMessage({ response: { status: 500 } }, "fallback"), "The service is temporarily unavailable. Please try again later.");
});

test("API errors prefer safe server messages and handle CSRF/session failures", () => {
  assert.equal(getApiErrorMessage({ response: { data: { error: { code: "CSRF_TOKEN_INVALID" } } } }, "fallback"), "Your security token expired. Please try that action again.");
  assert.equal(getApiErrorMessage({ response: { data: { error: { code: "VALIDATION_ERROR", message: "Invalid details." } } } }, "fallback"), "Invalid details.");
  assert.equal(getApiErrorMessage(null, "fallback"), "fallback");
});