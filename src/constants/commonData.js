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



const configuredBaseUrl = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL);

const isDev = Boolean(import.meta.env.DEV);
const runtimeOrigin =
	typeof window !== "undefined" ? window.location.origin : "";

const useSameOriginApiInProd =
	!isDev && shouldUseSameOriginApi(configuredBaseUrl, runtimeOrigin);



export const BASE_URL = isDev || useSameOriginApiInProd ? "/api" : (configuredBaseUrl || "/api");

export const SERVER_ORIGIN = isAbsoluteHttpUrl(configuredBaseUrl)
	? configuredBaseUrl.replace(/\/api$/i, "")
	: runtimeOrigin;


export const ENABLE_PREMIUM = String(import.meta.env.VITE_ENABLE_PREMIUM || "false").toLowerCase() === "true";
