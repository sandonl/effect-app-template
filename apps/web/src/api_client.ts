import { AppApi } from "@repo/http-api";
import { Effect } from "effect";
import { HttpApiClient } from "effect/unstable/httpapi";
import { effectRuntime } from "./effect_runtime";

const healthRequest = HttpApiClient.make(AppApi, {
  baseUrl: globalThis.location.origin,
}).pipe(Effect.flatMap((client) => client.health.check()));

export const getHealth = (signal?: AbortSignal) =>
  effectRuntime.runPromise(healthRequest, { signal });
