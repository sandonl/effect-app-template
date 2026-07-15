import { BrowserHttpClient } from "@effect/platform-browser";
import { AppApi } from "@repo/http-api";
import { AtomHttpApi } from "effect/unstable/reactivity";

export class AppApiClient extends AtomHttpApi.Service<AppApiClient>()(
  "AppApiClient",
  {
    api: AppApi,
    baseUrl: globalThis.location.origin,
    httpClient: BrowserHttpClient.layerFetch,
  },
) {}
