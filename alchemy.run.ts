import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import Api from "./infrastructure/cloudflare_api";

export default Alchemy.Stack(
  "EffectAppTemplate",
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const api = yield* Api;
    const web = yield* Cloudflare.Website.Vite("Web", {
      rootDir: "./apps/web",
      assets: {
        notFoundHandling: "single-page-application",
      },
      env: {
        VITE_API_URL: api.url.as<string>(),
      },
    });

    return {
      apiUrl: api.url,
      webUrl: web.url,
    };
  }),
);
