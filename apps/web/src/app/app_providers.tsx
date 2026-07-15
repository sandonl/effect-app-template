import { RegistryProvider } from "@effect/atom-react";
import type { PropsWithChildren } from "react";

export function AppProviders({ children }: PropsWithChildren) {
  return <RegistryProvider>{children}</RegistryProvider>;
}
