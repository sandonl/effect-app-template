const deployedApiUrl = import.meta.env.VITE_API_URL;

export const apiBaseUrl =
  deployedApiUrl === undefined || deployedApiUrl.length === 0
    ? globalThis.location.origin
    : new URL(deployedApiUrl).origin;
