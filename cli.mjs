#!/usr/bin/env node

import { createEnv } from 'yeoman-environment';
import npm from './package.json' assert { type: 'json' };

console.log(`generator-bitloops v${npm.version}`);

// Capture the subgenerator and additional arguments
const [, , subgenerator, ...args] = process.argv;

if (!subgenerator) {
  console.error('Please specify a subgenerator (e.g., "setup" or "init")');
  process.exit(1);
}

// Initialize Yeoman environment
const env = createEnv();

(async () => {
  // Dynamically import the subgenerator path
  const generatorPath = await import(`./${subgenerator}/index.js`);
  
  // Register your generator
  env.register(generatorPath.default, `bitloops:${subgenerator}`);

  // Convert arguments into a format suitable for Yeoman
  const options = args.reduce((acc, arg) => {
    const [key, value] = arg.split('=');
    acc[key.replace('--', '')] = value || true;
    return acc;
  }, {});

  // Run the generator with the specified subgenerator and options
  env.run(`bitloops:${subgenerator}`, options, (err) => {
    if (err) {
      console.error('Error running generator:', err);
      process.exit(1);
    }
  });
})();
