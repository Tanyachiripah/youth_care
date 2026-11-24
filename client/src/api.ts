import axios from "axios";
import { normalizeApiBaseUrl } from "./api-url";
export { getApiErrorMessage } from "./api-errors";

const apiBaseUrl = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);
let csrfToken: string | undefined;
let csrfTokenRequest: Promise<string> | undefined;

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use(async (config) => {
  if (["post", "put", "patch", "delete"].includes((config.method || "get").toLowerCase())) {
    const token = await getCsrfToken();
    config.headers.set("X-CSRF-Token", token);
  }
  return config;
});

api.interceptors.response.use((response) => {
  const returnedToken = response.data?.csrfToken;
  if (typeof returnedToken === "string") csrfToken = returnedToken;
  if (/\/auth\/logout$/.test(response.config.url || "")) csrfToken = undefined;
  return response;
}, (error: { response?: { status?: number; data?: { error?: { code?: string } } }; config?: { url?: string } }) => {
  const status = error.response?.status;
  const code = error.response?.data?.error?.code;
  if (status === 401 || code === "CSRF_TOKEN_INVALID") csrfToken = undefined;
  if (status === 401 && !isExpectedUnauthenticatedRequest(error.config?.url)) {
    window.dispatchEvent(new Event("youthcare:session-expired"));
  }
  return Promise.reject(error);
});

async function getCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;
  if (!csrfTokenRequest) {
    csrfTokenRequest = api.get<{ csrfToken: string }>("/csrf-token")
      .then(({ data }) => {
        csrfToken = data.csrfToken;
        return data.csrfToken;
      })
      .finally(() => { csrfTokenRequest = undefined; });
  }
  return csrfTokenRequest;
}

function isExpectedUnauthenticatedRequest(url?: string): boolean {
  return /\/auth\/(?:me|login|register|logout)$/.test(url || "");
}


export type User = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
};

export type Organisation = {
  _id: string;
  name: string;
  description: string;
  services: string[];
  location: string;
  verificationStatus: string;
  eligibility: string;
};

export type Resource = {
  _id: string;
  title: string;
  category: string;
  summary: string;
  body: string;
};

export type Opportunity = {
  _id: string;
  title: string;
  provider: string;
  category: string;
  location: string;
  description: string;
  applicationUrl: string;
};