export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== "object") return fallback;
  const response = (error as { response?: { status?: number; data?: { error?: { code?: string; message?: string } } } }).response;
  const status = response?.status;
  const code = response?.data?.error?.code;
  if (code === "CSRF_TOKEN_INVALID") return "Your security token expired. Please try that action again.";
  if (response?.data?.error?.message) return response.data.error.message;
  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 403) return "You do not have permission to perform this action.";
  if (status === 429) return "Too many requests. Please wait a moment and try again.";
  if (status !== undefined && status >= 500) return "The service is temporarily unavailable. Please try again later.";
  return fallback;
}