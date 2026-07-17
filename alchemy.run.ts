import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";

const ExampleAssets = Cloudflare.R2.Bucket("ExampleAssets");

export default Alchemy.Stack(
  "EffectAppTemplate",
  {
    providers: Cloudflare.providers(),
    state: Alchemy.localState(),
  },
  Effect.gen(function* () {
    const assets = yield* ExampleAssets;

    return {
      bucketName: assets.bucketName,
    };
  }),
);
