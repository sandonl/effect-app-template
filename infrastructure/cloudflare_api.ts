import * as Cloudflare from "alchemy/Cloudflare";
import { Effect, Layer, Path } from "effect";
import { Etag, HttpPlatform, HttpRouter } from "effect/unstable/http";
import { ApiLive } from "../apps/api/src/api_layer";

const CloudflareHttpPlatformLive = Layer.succeed(HttpPlatform.HttpPlatform, {
  fileResponse: () =>
    Effect.die("HttpPlatform.fileResponse is unavailable in a Worker"),
  fileWebResponse: () =>
    Effect.die("HttpPlatform.fileWebResponse is unavailable in a Worker"),
});

const CloudflareHttpLive = Layer.mergeAll(
  Etag.layer,
  CloudflareHttpPlatformLive,
  Path.layer,
);

export default Cloudflare.Worker(
  "Api",
  { main: import.meta.url },
  Effect.gen(function* () {
    const api = ApiLive.pipe(
      Layer.provide(CloudflareHttpLive),
      Layer.provide(
        HttpRouter.cors({
          allowedOrigins: ["*"],
          allowedMethods: ["GET", "OPTIONS"],
        }),
      ),
    );

    return {
      fetch: yield* HttpRouter.toHttpEffect(api),
    };
  }),
);
