export function normalizeApiBaseUrl(configuredUrl?: string): string {
  const value = configuredUrl?.trim();
  if (!value) return "/api";

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("VITE_API_URL must be an absolute HTTP or HTTPS API origin.");
  }

  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error("VITE_API_URL must be an HTTP or HTTPS origin without credentials, query, or fragment.");
  }

  const path = url.pathname.replace(/\/+$/, "");
  if (path && !/^(?:\/api)+$/i.test(path)) {
    throw new Error("VITE_API_URL must be an origin, optionally followed by /api.");
  }
  url.pathname = "/api";
  return url.toString().replace(/\/$/, "");
}