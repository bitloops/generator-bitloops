import { defineConfig } from 'cypress';
import * as fs from 'fs';
import * as path from 'path';
   
export default defineConfig({
  e2e: {
    specPattern: "**/*.cy.{ts,tsx}",
    supportFile: false,
    testIsolation: false,
    setupNodeEvents(on) {
      on('task', {
        saveTestResults(results) {
          const resultsPath = path.join(__dirname, '.', 'cypress', 'results', 'results.json');
          if (!fs.existsSync(resultsPath)) {
            fs.writeFileSync(resultsPath, '[]'); // Create file if it doesn't exist
          }
          const existingResults = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
          existingResults.push(JSON.parse(results));
          fs.writeFileSync(resultsPath, JSON.stringify(existingResults, null, 2));
          return null; // Indicate the task was successful
        }
      });
    },
  },
  reporter: "mochawesome",
    reporterOptions: {
      reportDir: "cypress/results",
      overwrite: true,
      html: true,
      json: true,
    },
});
