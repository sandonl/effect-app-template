import { Schema } from "effect";
import {
  HttpApi,
  HttpApiEndpoint,
  HttpApiGroup,
} from "effect/unstable/httpapi";

export const HealthResponse = Schema.Struct({
  status: Schema.Literal("ok"),
});

export type HealthResponse = typeof HealthResponse.Type;

export const HealthApi = HttpApiGroup.make("health").add(
  HttpApiEndpoint.get("check", "/api/health", {
    success: HealthResponse,
  }),
);

export const AppApi = HttpApi.make("app").add(HealthApi);
