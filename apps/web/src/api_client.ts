import { BrowserHttpClient } from "@effect/platform-browser";
import { AppApi } from "@repo/http-api";
import { AtomHttpApi } from "effect/unstable/reactivity";
import { apiBaseUrl } from "./public_config";

export class AppApiClient extends AtomHttpApi.Service<AppApiClient>()(
  "AppApiClient",
  {
    api: AppApi,
    baseUrl: apiBaseUrl,
    httpClient: BrowserHttpClient.layerFetch,
  },
) {}
