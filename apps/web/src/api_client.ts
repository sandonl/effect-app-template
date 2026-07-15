import { AppApi } from "@repo/http-api";
import { HttpApiClient } from "effect/unstable/httpapi";
import { effectRuntime } from "./effect_runtime";

const makeClient = () =>
  effectRuntime.runPromise(
    HttpApiClient.make(AppApi, {
      baseUrl: globalThis.location.origin,
    }),
  );

let client: ReturnType<typeof makeClient> | undefined;

const getClient = () => (client ??= makeClient());

export async function getHealth(signal?: AbortSignal) {
  const apiClient = await getClient();

  return effectRuntime.runPromise(apiClient.health.check(), { signal });
}
