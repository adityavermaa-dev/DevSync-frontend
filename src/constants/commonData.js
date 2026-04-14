const trimTrailingSlash = (value) => {
	if (!value) return value;
	return value.endsWith("/") ? value.slice(0, -1) : value;
};

const isAbsoluteHttpUrl = (value) => /^https?:\/\//i.test(value || "");
const normalizeHost = (value) => (value || "").replace(/^www\./i, "").toLowerCase();

const shouldUseSameOriginApi = (configuredUrl, runtimeUrl) => {
	if (!isAbsoluteHttpUrl(configuredUrl) || !isAbsoluteHttpUrl(runtimeUrl)) {
		return false;
	}

	try {
		const configured = new URL(configuredUrl);
		const runtime = new URL(runtimeUrl);

		const sameProtocol = configured.protocol === runtime.protocol;
		const samePort = (configured.port || "") === (runtime.port || "");
		const sameHostIgnoringWww = normalizeHost(configured.hostname) === normalizeHost(runtime.hostname);

		return sameProtocol && samePort && sameHostIgnoringWww;
	} catch {
		return false;
	}
};

// Prefer explicit configuration, otherwise use same-origin `/api`.
// In development, Vite proxies `/api` to the backend to avoid CORS issues.
const configuredBaseUrl = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL);

const isDev = Boolean(import.meta.env.DEV);
const runtimeOrigin =
	typeof window !== "undefined" ? window.location.origin : "";

const useSameOriginApiInProd =
	!isDev && shouldUseSameOriginApi(configuredBaseUrl, runtimeOrigin);

// In development we always use the Vite proxy so auth requests stay same-origin.
// In production you can point to a real API origin with VITE_API_BASE_URL.
export const BASE_URL = isDev || useSameOriginApiInProd ? "/api" : (configuredBaseUrl || "/api");

export const SERVER_ORIGIN = isAbsoluteHttpUrl(configuredBaseUrl)
	? configuredBaseUrl.replace(/\/api$/i, "")
	: runtimeOrigin;

// Premium flows are kept code-ready but hidden until explicitly enabled.
export const ENABLE_PREMIUM = String(import.meta.env.VITE_ENABLE_PREMIUM || "false").toLowerCase() === "true";
