/// <reference types="node" />

import assert from "node:assert/strict";
import test from "node:test";
import { normalizeApiBaseUrl } from "./api-url";

test("API URL defaults to the local same-origin proxy", () => {
  assert.equal(normalizeApiBaseUrl(undefined), "/api");
  assert.equal(normalizeApiBaseUrl("  "), "/api");
});

test("API URL normalizes trailing slashes and existing API suffixes", () => {
  assert.equal(normalizeApiBaseUrl("https://api.example.test/"), "https://api.example.test/api");
  assert.equal(normalizeApiBaseUrl("https://api.example.test/api/"), "https://api.example.test/api");
  assert.equal(normalizeApiBaseUrl("https://api.example.test/api/api"), "https://api.example.test/api");
});

test("API URL rejects non-HTTP origins and query strings", () => {
  assert.throws(() => normalizeApiBaseUrl("javascript:alert(1)"), /HTTP or HTTPS/);
  assert.throws(() => normalizeApiBaseUrl("https://api.example.test?key=value"), /without credentials/);
  assert.throws(() => normalizeApiBaseUrl("https://api.example.test/prefix"), /origin, optionally/);
});