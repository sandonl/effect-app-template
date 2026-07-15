import { createServer } from "node:http";
import { NodeHttpServer } from "@effect/platform-node";
import { AppApi } from "@repo/http-api";
import { Config, Layer } from "effect";
import { HttpRouter } from "effect/unstable/http";
import { HttpApiBuilder } from "effect/unstable/httpapi";
import { HealthHandlersLive } from "./handlers/health_handler";

const ApiLive = HttpApiBuilder.layer(AppApi).pipe(
  Layer.provide(HealthHandlersLive),
);

const HttpServerLive = NodeHttpServer.layerConfig(createServer, {
  port: Config.port("PORT").pipe(Config.withDefault(3000)),
});

export const AppLive = HttpRouter.serve(ApiLive).pipe(
  Layer.provide(HttpServerLive),
);
