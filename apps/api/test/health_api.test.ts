import { NodeHttpServer } from "@effect/platform-node";
import { AppApi } from "@repo/http-api";
import { expect, it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { HttpRouter } from "effect/unstable/http";
import { HttpApiBuilder, HttpApiClient } from "effect/unstable/httpapi";
import { HealthHandlersLive } from "../src/handlers/health_handler";

it.effect(
  "reports that the application is healthy through its HTTP contract",
  () => {
    const apiLive = HttpApiBuilder.layer(AppApi).pipe(
      Layer.provide(HealthHandlersLive),
    );
    const serverLive = HttpRouter.serve(apiLive, {
      disableListenLog: true,
      disableLogger: true,
    }).pipe(Layer.provideMerge(NodeHttpServer.layerTest));

    return Effect.gen(function* () {
      const client = yield* HttpApiClient.make(AppApi);
      const response = yield* client.health.check();

      expect(response).toEqual({ status: "ok" });
    }).pipe(Effect.provide(serverLive));
  },
);
