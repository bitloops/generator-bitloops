import fs from 'fs';
import { spawnSync } from 'child_process';
import { exec, execSync } from 'child_process';
import Generator from 'yeoman-generator';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert `import.meta.url` to a path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOT = '.';
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 2000;
const STORYBOOK_FOLDER = '.storybook';
const PLATFORM_NEXT_FOLDER = 'platform-next';
const PLATFORM_NEXT_SRC_FOLDER = `${PLATFORM_NEXT_FOLDER}/src`;
const PLATFORM_VITE_FOLDER = 'platform-vite';
const PLATFORM_VITE_SRC_FOLDER = `${PLATFORM_VITE_FOLDER}/src`;
const LIB_TYPES_FOLDER = 'lib/types';
const LIB_ROUTER_FOLDER = 'lib/router';

function isKebabCase(str) {
  // Check if the string is empty
  if (!str || str.trim().length === 0) {
    return false;
  }

  // Regular expression to check if a string is kebab-case,
  // ensuring it starts with a lowercase letter or digit, allowing for lowercase letters and digits in the middle or end,
  // and ensuring each new word starts with a lowercase letter or digit
  const kebabCaseRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  return kebabCaseRegex.test(str);
}

function toKebabCase(str) {
  if (isKebabCase(str)) {
    return str;
  }

  const words = str
    .trim()
    // Split by non-alphanumeric characters and the transition from lowercase to uppercase
    .split(/(?=[A-Z])|[^a-zA-Z0-9]+/)
    .filter((word) => word.length > 0);

  return words
    .map((word) => word.toLowerCase())
    .filter((word) => word.length > 0) // Remove empty words
    .join('-');
}

function deleteFileIfExists(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

/** Runs spawnSync and throws if exit code is non-zero (so steps can be retried). */
function runSync(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', ...options });
  if (result.status !== 0) {
    const msg = result.error
      ? result.error.message
      : `Exit code ${result.status}`;
    throw new Error(`${command} ${args.join(' ')} failed: ${msg}`);
  }
  return result;
}

export default class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.sourceRoot(path.join(__dirname, 'templates'));

    // Define options
    this.option('project', {
      type: String,
      description: 'Project name (used to create the project folder)',
      required: true,
    });

    this.option('nextjs', {
      type: Boolean,
      description: 'Install Next.js',
      required: true, // Make Next.js mandatory
      default: false,
    });

    this.option('typescript', {
      type: Boolean,
      description: 'Add TypeScript support',
      default: false,
    });

    this.option('tailwind', {
      type: Boolean,
      description: 'Add Tailwind CSS',
      default: false,
    });

    this.option('storybook', {
      type: Boolean,
      description: 'Add Storybook',
      default: false,
    });

    this.option('cypress', {
      type: Boolean,
      description: 'Add Cypress for testing',
      default: false,
    });

    this.option('bitloops', {
      type: Boolean,
      description: 'Add Bitloops specific boilerplate files',
      default: false,
    });

    this.option('git', {
      type: Boolean,
      description: 'Commit changes to git',
      default: false,
    });

    this.option('primitives', {
      type: Boolean,
      description: 'Add primitives support',
      default: false,
    });

    this.option('i18n', {
      type: Boolean,
      description:
        'Add i18n internationalization support (i18next, i18next-icu, react-i18next)',
      default: false,
    });

    this.option('baseUi', {
      type: Boolean,
      description: 'Add Base UI React components (@base-ui/react)',
      default: false,
    });

    this.option('redux', {
      type: Boolean,
      description: 'Add Redux Toolkit and React Redux for state management',
      default: false,
    });

    this.option('vitest', {
      type: Boolean,
      description: 'Add Vitest testing framework with coverage and UI',
      default: false,
    });

    this.option('webVitals', {
      type: Boolean,
      description: 'Add web-vitals for performance monitoring',
      default: false,
    });

    this.option('zod', {
      type: Boolean,
      description: 'Add Zod for schema validation',
      default: false,
    });

    this.option('bundleAnalyzer', {
      type: Boolean,
      description: 'Add @next/bundle-analyzer for bundle analysis',
      default: false,
    });

    this.option('reactIcons', {
      type: Boolean,
      description: 'Add react-icons library',
      default: false,
    });

    this.option('msw', {
      type: Boolean,
      description: 'Add Mock Service Worker (MSW) for API mocking',
      default: false,
    });

    this.option('reactCompiler', {
      type: Boolean,
      description: 'Add babel-plugin-react-compiler',
      default: false,
    });

    this.installNextJS = async function () {
      // Clone Next.js template with Tailwind if specified, using the project name
      const createNextAppCommand = ['-y', 'create-next-app@latest'];
      createNextAppCommand.push(toKebabCase(this.options.project)); // Use the project name for the directory
      createNextAppCommand.push('--yes');
      createNextAppCommand.push('--app');
      createNextAppCommand.push('--empty');
      createNextAppCommand.push('--src-dir');
      createNextAppCommand.push('--import-alias');
      createNextAppCommand.push('@/*');
      createNextAppCommand.push('--use-pnpm');
      createNextAppCommand.push('--eslint');

      if (this.options.typescript) {
        createNextAppCommand.push('--typescript'); // This will avoid the TypeScript prompt
      } else {
        createNextAppCommand.push('--js');
      }

      if (this.options.tailwind) {
        createNextAppCommand.push('--tailwind');
      }

      this.log('Installing Next.js...');
      const patchPackages = ''; //'next@14 react@18 react-dom@18';
      const additionalPackages = `react-tooltip ${patchPackages} class-variance-authority tailwind-merge`;
      const installCommand = `npx ${createNextAppCommand.join(' ')} && cd ${toKebabCase(
        this.options.project,
      )} && pnpm add ${additionalPackages}`;
      const INSTALL_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
      await new Promise((resolve, reject) => {
        const child = exec(installCommand, {
          maxBuffer: 10 * 1024 * 1024, // 10MB to avoid EPIPE when output is large
        });
        const timeoutId = setTimeout(() => {
          child.kill('SIGTERM');
          reject(
            new Error(
              `Next.js install did not finish within ${INSTALL_TIMEOUT_MS / 60000} minutes. Try again or run the command manually.`,
            ),
          );
        }, INSTALL_TIMEOUT_MS);
        child.on('exit', (code) => {
          clearTimeout(timeoutId);
          if (code !== 0) {
            reject(
              new Error(
                `Next.js install exited with code ${code}. Check the output above for errors.`,
              ),
            );
            return;
          }
          this.destinationRoot(
            this.destinationPath(toKebabCase(this.options.project)),
          );
          resolve();
        });
        child.on('error', (err) => {
          clearTimeout(timeoutId);
          reject(
            new Error(
              `Next.js install failed: ${err.message}. You may have hit a network or spawn issue; try again.`,
            ),
          );
        });
      });
    };

    this.installStorybook = function () {
      // Conditionally initialize Storybook
      if (this.options.storybook) {
        this.log('Installing Storybook...');
        const versionsRaw = execSync('npm view storybook versions --json', {
          encoding: 'utf-8',
          timeout: 30000, // 30s – avoid hanging on slow/unresponsive registry
        });
        const versions = JSON.parse(versionsRaw);

        // Filter for stable 10.x versions (exclude alpha/beta/rc)
        const stableVersions = versions
          .filter((version) => version.startsWith('10.'))
          .filter((version) => !version.includes('-')); // Exclude pre-releases like -alpha or -beta

        // Sort descending and get the latest
        const latest10 = stableVersions.sort((a, b) => {
          // Split version strings like '10.0.9' into [10, 0, 9]
          const aParts = a.split(DOT).map(Number);
          const bParts = b.split(DOT).map(Number);
          // Compare major, then minor, then patch
          if (aParts[0] !== bParts[0]) return bParts[0] - aParts[0];
          if (aParts[1] !== bParts[1]) return bParts[1] - aParts[1];
          return bParts[2] - aParts[2];
        })[0];

        if (!latest10) {
          throw new Error('No stable 10.x versions found.');
        }

        this.log(`Latest stable 10.x version: ${latest10}`);
        // Initializing storybook with nextjs+vite
        runSync('npx', [
          '-y',
          `storybook@${latest10}`,
          'init',
          '--no-dev',
          '--yes',
          '--type',
          'nextjs',
          '--builder',
          'vite',
        ], { cwd: this.destinationRoot() });
        this.log('Storybook installed!');
        // Verifies the correct nextjs-vite framework is used
        runSync('pnpm', ['add', '-D', '@storybook/nextjs-vite@^10'], {
          cwd: this.destinationRoot(),
        });
        this.log('@storybook/nextjs-vite installed!');
      }
    };

    this.installCypress = function () {
      // Conditionally add Cypress
      if (this.options.cypress) {
        this.log('Installing Cypress...');
        runSync('pnpm', ['add', '-D', 'cypress'], {
          cwd: this.destinationRoot(),
        });
        this.log('Cypress installed!');
        if (this.options.bitloops) {
          runSync('pnpm', [
            'add',
            '-D',
            'mochawesome',
            'mochawesome-merge',
            'mochawesome-report-generator',
          ], { cwd: this.destinationRoot() });
        }
      }
    };

    this.installI18n = function () {
      // Conditionally add i18n packages
      if (this.options.i18n) {
        this.log('Installing i18n packages...');
        runSync('pnpm', ['add', 'i18next', 'i18next-icu', 'react-i18next'], {
          cwd: this.destinationRoot(),
        });
        this.log('i18n packages installed!');
      }
    };

    this.installBaseUi = function () {
      // Conditionally add Base UI
      if (this.options.baseUi) {
        this.log('Installing Base UI...');
        runSync('pnpm', ['add', '@base-ui/react@^1.1.0'], {
          cwd: this.destinationRoot(),
        });
        this.log('Base UI installed!');
      }
    };

    this.installRedux = function () {
      // Conditionally add Redux Toolkit and React Redux
      if (this.options.redux) {
        this.log('Installing Redux Toolkit and React Redux...');
        runSync('pnpm', ['add', '@reduxjs/toolkit', 'react-redux'], {
          cwd: this.destinationRoot(),
        });
        this.log('Redux Toolkit and React Redux installed!');
      }
    };

    this.installVitest = function () {
      // Conditionally add Vitest and related testing packages
      if (this.options.vitest) {
        this.log('Installing Vitest and testing packages...');
        runSync('pnpm', [
          'add',
          '-D',
          'vitest',
          '@vitest/ui',
          '@vitest/coverage-v8',
          '@vitest/browser-playwright',
          '@testing-library/react',
          '@testing-library/jest-dom',
          '@testing-library/user-event',
          '@vitejs/plugin-react',
          'vite',
          'jsdom',
          'playwright',
        ], { cwd: this.destinationRoot() });
        this.log('Vitest and testing packages installed!');
      }
    };

    this.installWebVitals = function () {
      // Conditionally add web-vitals
      if (this.options.webVitals) {
        this.log('Installing web-vitals...');
        runSync('pnpm', ['add', 'web-vitals'], {
          cwd: this.destinationRoot(),
        });
        this.log('web-vitals installed!');
      }
    };

    this.installZod = function () {
      // Conditionally add Zod
      if (this.options.zod) {
        this.log('Installing Zod...');
        runSync('pnpm', ['add', 'zod'], {
          cwd: this.destinationRoot(),
        });
        this.log('Zod installed!');
      }
    };

    this.installBundleAnalyzer = function () {
      // Conditionally add @next/bundle-analyzer
      if (this.options.bundleAnalyzer) {
        this.log('Installing @next/bundle-analyzer...');
        runSync('pnpm', ['add', '-D', '@next/bundle-analyzer'], {
          cwd: this.destinationRoot(),
        });
        this.log('@next/bundle-analyzer installed!');
      }
    };

    this.installReactIcons = function () {
      // Conditionally add react-icons
      if (this.options.reactIcons) {
        this.log('Installing react-icons...');
        runSync('pnpm', ['add', 'react-icons'], {
          cwd: this.destinationRoot(),
        });
        this.log('react-icons installed!');
      }
    };

    this.installMsw = function () {
      // Conditionally add Mock Service Worker
      if (this.options.msw) {
        this.log('Installing Mock Service Worker (MSW)...');
        runSync('pnpm', ['add', '-D', 'msw'], {
          cwd: this.destinationRoot(),
        });
        // Initialize MSW
        runSync('npx', ['msw', 'init', 'public/', '--save'], {
          cwd: this.destinationRoot(),
        });
        this.log('MSW installed!');
      }
    };

    this.installReactCompiler = function () {
      // Conditionally add babel-plugin-react-compiler
      if (this.options.reactCompiler) {
        this.log('Installing babel-plugin-react-compiler...');
        runSync('pnpm', ['add', '-D', 'babel-plugin-react-compiler'], {
          cwd: this.destinationRoot(),
        });
        this.log('babel-plugin-react-compiler installed!');
      }
    };

    this.installIntlMessageFormat = function () {
      // Add intl-messageformat when i18n is enabled
      if (this.options.i18n) {
        this.log('Installing intl-messageformat...');
        runSync('pnpm', ['add', 'intl-messageformat'], {
          cwd: this.destinationRoot(),
        });
        this.log('intl-messageformat installed!');
      }
    };

    this.installPrimitives = function () {
      // Conditionally add Primitives
      if (this.options.primitives) {
        this.log('Installing Primitives...');

        // Platform Next files
        const platformNextFiles = [
          `${PLATFORM_NEXT_SRC_FOLDER}/index.ts`,
          `${PLATFORM_NEXT_SRC_FOLDER}/Img.tsx`,
          `${PLATFORM_NEXT_SRC_FOLDER}/Link.tsx`,
          `${PLATFORM_NEXT_SRC_FOLDER}/setup.ts`,
          `${PLATFORM_NEXT_SRC_FOLDER}/router/index.ts`,
          `${PLATFORM_NEXT_SRC_FOLDER}/router/useNextRouter.ts`,
        ];

        platformNextFiles.forEach((filePath) => {
          deleteFileIfExists(this.destinationPath(filePath));
          this.fs.copyTpl(
            this.templatePath(filePath),
            this.destinationPath(filePath),
          );
        });

        // Platform Vite files
        const platformViteFiles = [
          `${PLATFORM_VITE_SRC_FOLDER}/index.ts`,
          `${PLATFORM_VITE_SRC_FOLDER}/Img.tsx`,
          `${PLATFORM_VITE_SRC_FOLDER}/Link.tsx`,
          `${PLATFORM_VITE_SRC_FOLDER}/setup.ts`,
          `${PLATFORM_VITE_SRC_FOLDER}/router/index.ts`,
          `${PLATFORM_VITE_SRC_FOLDER}/router/useViteRouter.ts`,
        ];

        platformViteFiles.forEach((filePath) => {
          deleteFileIfExists(this.destinationPath(filePath));
          this.fs.copyTpl(
            this.templatePath(filePath),
            this.destinationPath(filePath),
          );
        });

        // Lib types files
        const libTypesFiles = [
          `${LIB_TYPES_FOLDER}/primitives.types.ts`,
          `${LIB_TYPES_FOLDER}/image.types.ts`,
          `${LIB_TYPES_FOLDER}/types.d.ts`,
        ];

        libTypesFiles.forEach((filePath) => {
          deleteFileIfExists(this.destinationPath(filePath));
          this.fs.copyTpl(
            this.templatePath(filePath),
            this.destinationPath(filePath),
          );
        });

        // Lib router files
        const libRouterFiles = [
          `${LIB_ROUTER_FOLDER}/index.ts`,
          `${LIB_ROUTER_FOLDER}/types.ts`,
          `${LIB_ROUTER_FOLDER}/useRouter.ts`,
        ];

        libRouterFiles.forEach((filePath) => {
          deleteFileIfExists(this.destinationPath(filePath));
          this.fs.copyTpl(
            this.templatePath(filePath),
            this.destinationPath(filePath),
          );
        });

        this.log('Primitives installed!');
      }
    };

    this.patchFiles = async function () {
      // Conditionally initialize Storybook
      if (this.options.storybook) {
        this.log('Making Storybook changes...');

        // Copy .storybook template files
        const storybookFiles = [`${STORYBOOK_FOLDER}/main.ts`];

        // Delete .storybook/preview.ts if it exists (generated by storybook init)
        deleteFileIfExists(
          this.destinationPath(`${STORYBOOK_FOLDER}/preview.ts`),
        );

        storybookFiles.forEach((filePath) => {
          deleteFileIfExists(this.destinationPath(filePath));
          this.fs.copyTpl(
            this.templatePath(filePath),
            this.destinationPath(filePath),
          );
        });

        this.log('Removing default Storybook stories...');
        try {
          fs.rmSync(this.destinationPath('src/stories'), {
            recursive: true,
            force: true,
          });
          console.log('Sample stories directory deleted successfully!');
        } catch (err) {
          console.error('Error deleting sample stories directory:', err);
        }
      }

      if (this.options.cypress) {
        this.log('Adding Cypress config...');
        this.fs.copyTpl(
          this.templatePath('cypress.config.ts'),
          this.destinationPath('cypress.config.ts'),
        );
      }

      deleteFileIfExists(this.destinationPath('src/app/page.tsx'));
      this.fs.copyTpl(
        this.templatePath('next.app.page.tsx'),
        this.destinationPath('src/app/page.tsx'),
      );

      deleteFileIfExists(this.destinationPath('src/app/layout.tsx'));
      this.fs.copyTpl(
        this.templatePath('next.app.layout.tsx'),
        this.destinationPath('src/app/layout.tsx'),
        { projectName: this.options.project },
      );

      this.log('Adding Meyer reset in global.css...');
      deleteFileIfExists(this.destinationPath('src/app/globals.css'));
      this.fs.copyTpl(
        this.templatePath('globals.css'),
        this.destinationPath('src/app/globals.css'),
      );

      if (this.options.typescript) {
        this.log('Replacing tsconfig.json with Bitloops template...');
        deleteFileIfExists(this.destinationPath('tsconfig.json'));
        this.fs.copyTpl(
          this.templatePath('tsconfig.json'),
          this.destinationPath('tsconfig.json'),
        );
        this.log('tsconfig.json updated!');
      }

      if (this.options.bitloops) {
        this.log('Adding Bitloops support components...');
        const unsupportedPath =
          'src/components/bitloops/unsupported/Unsupported.tsx';
        this.fs.copyTpl(
          this.templatePath(unsupportedPath),
          this.destinationPath(unsupportedPath),
        );
        const buttonPath = 'src/components/bitloops/button/Button.tsx';
        this.fs.copyTpl(
          this.templatePath(buttonPath),
          this.destinationPath(buttonPath),
        );
        if (this.options.storybook) {
          const unsupportedPath =
            'src/components/bitloops/unsupported/Unsupported.stories.tsx';
          this.fs.copyTpl(
            this.templatePath(unsupportedPath),
            this.destinationPath(unsupportedPath),
          );
          const buttonPath =
            'src/components/bitloops/button/Button.stories.tsx';
          this.fs.copyTpl(
            this.templatePath(buttonPath),
            this.destinationPath(buttonPath),
          );
        }
        if (this.options.cypress) {
          const path = 'cypress/helpers/index.ts';
          this.fs.copyTpl(this.templatePath(path), this.destinationPath(path));
        }
        runSync('pnpm', ['add', '-D', 'react-aria-components'], {
          cwd: this.destinationRoot(),
        });
      }
    };

    this.patchPackageJsonScripts = async function () {
      this.log('Patching package.json scripts...');
      const packageJsonPath = this.destinationPath('package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      // Add vitest scripts if vitest is enabled
      if (this.options.vitest) {
        packageJson.scripts.test = 'vitest';
        packageJson.scripts['test:ui'] = 'vitest --ui';
        packageJson.scripts['test:coverage'] = 'vitest run --coverage';
      }

      // Add type-check script if typescript is enabled
      if (this.options.typescript) {
        packageJson.scripts['type-check'] = 'tsc --noEmit';
      }

      // Add analyze script if bundleAnalyzer is enabled
      if (this.options.bundleAnalyzer) {
        packageJson.scripts.analyze = 'ANALYZE=true next build';
      }

      // Add msw configuration if msw is enabled
      if (this.options.msw) {
        packageJson.msw = {
          workerDirectory: ['public'],
        };
      }

      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      this.log('package.json scripts patched!');
    };

    this.commitChanges = async function () {
      this.log('Committing changes to git...');
      await new Promise((resolve, reject) => {
        const child = exec(
          `cd ${toKebabCase(
            this.options.project,
          )} && git add . && git commit -m "Initial setup"`,
        );
        child.on('exit', (code) => {
          if (code !== 0) {
            this.log('Error committing changes to git! ', code);
          } else {
            this.log('Git changes committed!');
          }
          resolve();
        });
        child.on('error', (err) => {
          this.log('Git commit failed: ', err.message);
          resolve(); // do not fail the whole run if git commit fails
        });
      });
    };

    /** Runs a step (sync or async), retrying up to MAX_RETRIES times on failure. */
    this.withRetry = async function (fn, stepName) {
      let lastErr;
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          return await Promise.resolve(fn());
        } catch (err) {
          lastErr = err;
          if (attempt === MAX_RETRIES) break;
          this.log(
            `Step "${stepName}" failed (attempt ${attempt}/${MAX_RETRIES}): ${err.message}. Retrying in ${RETRY_DELAY_MS / 1000}s...`,
          );
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        }
      }
      throw lastErr;
    };
  }

  initializing() {
    // Check if the project name and --nextjs flag are provided
    if (!this.options.project) {
      this.log(
        'Error: --project option is required to specify the project name.',
      );
      process.exit(1);
    }

    if (!this.options.nextjs) {
      this.log(
        'Error: --nextjs option is currently required to scaffold a project.',
      );
      process.exit(1);
    }

    this.log(
      `Initializing project ${toKebabCase(
        this.options.project,
      )} with the selected options...`,
    );
  }

  async main() {
    await this.withRetry(() => this.installNextJS(), 'Next.js install');
    await this.withRetry(() => this.installCypress(), 'Cypress');
    await this.withRetry(() => this.installI18n(), 'i18n');
    await this.withRetry(() => this.installIntlMessageFormat(), 'intl-messageformat');
    await this.withRetry(() => this.installBaseUi(), 'Base UI');
    await this.withRetry(() => this.installRedux(), 'Redux');
    await this.withRetry(() => this.installVitest(), 'Vitest');
    await this.withRetry(() => this.installWebVitals(), 'web-vitals');
    await this.withRetry(() => this.installZod(), 'Zod');
    await this.withRetry(() => this.installBundleAnalyzer(), 'bundle-analyzer');
    await this.withRetry(() => this.installReactIcons(), 'react-icons');
    await this.withRetry(() => this.installMsw(), 'MSW');
    await this.withRetry(() => this.installReactCompiler(), 'react-compiler');
    await this.withRetry(() => this.installPrimitives(), 'Primitives');
    await this.withRetry(() => this.installStorybook(), 'Storybook');
    await this.withRetry(() => this.patchFiles(), 'Patch files');
    await this.withRetry(() => this.patchPackageJsonScripts(), 'Patch package.json');
    if (this.options.git) {
      await this.withRetry(() => this.commitChanges(), 'Git commit');
    }
  }

  end() {
    this.log(
      `Your Bitloops project '${toKebabCase(
        this.options.project,
      )}' setup is complete! 🎉🎉🎉`,
    );
    this.log('');
    this.log('Use the following commands to start:');
    this.log('- `pnpm dev` to start the Next.js app.');
    if (this.options.storybook)
      this.log('- `pnpm storybook` to start Storybook.');
    if (this.options.cypress)
      this.log('- `npx cypress open --e2e --browser chrome` to open Cypress.');
    if (this.options.cypress)
      this.log(
        '- `npx cypress run --e2e --browser chrome` to run Cypress on the terminal.',
      );
  }
}
