import { AppApi } from "@repo/http-api";
import { Layer } from "effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";
import { HealthHandlersLive } from "./handlers/health_handler";

export const ApiLive = HttpApiBuilder.layer(AppApi).pipe(
  Layer.provide(HealthHandlersLive),
);
