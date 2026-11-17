// TanStack's route plugin manages Fast Refresh for route exports.
/* oxlint-disable react/only-export-components */
import "@repo/ui/tokens.css";
import "../styles/globals.css";
import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { StrictMode, type ReactNode } from "react";
import { AppProviders } from "../app/app_providers";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Effect app template" },
    ],
  }),
  shellComponent: RootDocument,
  component: RootComponent,
});

function RootComponent() {
  return (
    <StrictMode>
      <AppProviders>
        <Outlet />
      </AppProviders>
    </StrictMode>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
