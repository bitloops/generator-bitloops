import { defineConfig } from 'cypress';
   
export default defineConfig({
  e2e: {
    specPattern: "**/*.cy.{ts,tsx}",
    supportFile: false,
    testIsolation: false,
  },
  reporter: "mochawesome",
  reporterOptions: {
    reportDir: "cypress/results",
    overwrite: true,
    html: true,
    json: true,
    reportTitle: "Component Testing",
    reportPageTitle: "Bitloops Component Testing",
    charts: true,
    reportFilename: "report",
    code: true,
    showPassed: true,
    showFailed: true,
    showSkipped: true,
    saveJson: true,
  },
});
