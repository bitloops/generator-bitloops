import { defineConfig } from 'cypress';
   
export default defineConfig({
  e2e: {
    specPattern: "**/*.cy.{ts,tsx}",
    supportFile: false,
  },
});
