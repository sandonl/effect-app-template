import { AppApiClient } from "../../api_client";

export const healthAtom = AppApiClient.query("health", "check", {});
