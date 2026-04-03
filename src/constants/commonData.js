const trimTrailingSlash = (value) => {
	if (!value) return value;
	return value.endsWith("/") ? value.slice(0, -1) : value;
};

const isAbsoluteHttpUrl = (value) => /^https?:\/\//i.test(value || "");

// Prefer explicit configuration, otherwise use same-origin `/api`.
// In development, Vite proxies `/api` to the backend to avoid CORS issues.
const configuredBaseUrl = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL);

const isDev = Boolean(import.meta.env.DEV);

// In development we always use the Vite proxy so auth requests stay same-origin.
// In production you can point to a real API origin with VITE_API_BASE_URL.
export const BASE_URL = isDev ? "/api" : (configuredBaseUrl || "/api");

const runtimeOrigin =
	typeof window !== "undefined" ? window.location.origin : "";

export const SERVER_ORIGIN = isAbsoluteHttpUrl(configuredBaseUrl)
	? configuredBaseUrl.replace(/\/api$/i, "")
	: runtimeOrigin;
