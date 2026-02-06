import type { Router } from "@/lib/router/types";

export function useViteRouter(): Router {
  return {
    push: (url: string) => {
      console.log("[Storybook Router] Push to:", url);
      // In Storybook, we don't actually navigate
      // This could be enhanced with Storybook actions addon
    },
    replace: (url: string) => {
      console.log("[Storybook Router] Replace with:", url);
    },
    back: () => {
      console.log("[Storybook Router] Go back");
    },
  };
}
