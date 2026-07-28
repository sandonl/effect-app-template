import { createServer } from "node:http";
import { NodeHttpServer } from "@effect/platform-node";
import { Config, Layer } from "effect";
import { HttpRouter } from "effect/unstable/http";
import { ApiLive } from "./api_layer";

const HttpServerLive = NodeHttpServer.layerConfig(createServer, {
  port: Config.port("PORT").pipe(Config.withDefault(3000)),
});

export const AppLive = HttpRouter.serve(ApiLive).pipe(
  Layer.provide(HttpServerLive),
);
