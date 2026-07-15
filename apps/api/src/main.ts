import { NodeRuntime } from "@effect/platform-node";
import { Layer } from "effect";
import { AppLive } from "./app_layer";

NodeRuntime.runMain(Layer.launch(AppLive));
