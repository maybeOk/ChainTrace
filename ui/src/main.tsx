import React from "react";
import ReactDOM from "react-dom/client";
import "@radix-ui/themes/styles.css";

import { DAppKitProvider } from "@mysten/dapp-kit-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Theme } from "@radix-ui/themes";
import App from "./App.tsx";
import { dAppKit } from "./dapp-kit.ts";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LanguageProvider>
      <ThemeProvider>
        <Theme appearance="dark">
          <QueryClientProvider client={queryClient}>
            <DAppKitProvider dAppKit={dAppKit}>
              <App />
            </DAppKitProvider>
          </QueryClientProvider>
        </Theme>
      </ThemeProvider>
    </LanguageProvider>
  </React.StrictMode>,
);