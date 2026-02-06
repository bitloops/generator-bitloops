import React from "react";
import type { Preview } from "@storybook/nextjs-vite";
import {
  fontConfig,
  generateGoogleFontsUrl,
} from "../src/lib/fonts/fonts.config";
import "../platform-vite/src/setup";
import "../src/app/globals.css";
import "../src/i18n";
import { worker } from "../src/mocks/browser";
import { Provider } from "react-redux";
import { store } from "../src/store";

await worker.start({ onUnhandledRequest: "bypass" });

// Inject Google Fonts stylesheet and CSS variables
if (typeof document !== "undefined") {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = generateGoogleFontsUrl();
  document.head.appendChild(link);

  // Set CSS variables
  const style = document.createElement("style");
  style.textContent = `
    :root {
      ${fontConfig.montserrat.variable}: '${fontConfig.montserrat.family}', system-ui, sans-serif;
      ${fontConfig.roboto.variable}: '${fontConfig.roboto.family}', system-ui, sans-serif;
    }
  `;
  document.head.appendChild(style);
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
  },
  decorators: [
    (Story) => (
      <Provider store={store}>
        <Story />
      </Provider>
    ),
  ],
};

export default preview;
