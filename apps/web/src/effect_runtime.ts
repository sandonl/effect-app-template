import { BrowserHttpClient } from "@effect/platform-browser";
import { ManagedRuntime } from "effect";

export const effectRuntime = ManagedRuntime.make(BrowserHttpClient.layerFetch);

globalThis.addEventListener("beforeunload", () => {
  void effectRuntime.dispose();
});

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    void effectRuntime.dispose();
  });
}
