import { AppApi } from "@repo/http-api";
import { Effect } from "effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";

export const HealthHandlersLive = HttpApiBuilder.group(
  AppApi,
  "health",
  (handlers) =>
    handlers.handle("check", () => Effect.succeed({ status: "ok" as const })),
);
