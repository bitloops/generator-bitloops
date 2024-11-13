import fs from 'fs';
import { exec } from 'child_process';
import Generator from 'yeoman-generator';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert `import.meta.url` to a path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

    this.installNextJS = async function () {
      // Clone Next.js template with Tailwind if specified, using the project name
      const createNextAppCommand = ['-y', 'create-next-app@14.2.16'];
      createNextAppCommand.push(toKebabCase(this.options.project)); // Use the project name for the directory
      createNextAppCommand.push('--app');
      createNextAppCommand.push('--empty');
      createNextAppCommand.push('--src-dir');
      // createNextAppCommand.push('--turbopack'); when we go to Next.js 15
      createNextAppCommand.push('--import-alias');
      createNextAppCommand.push('@/*');
      createNextAppCommand.push('--use-npm');
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
      const additionalPackages = `react-tooltip ${patchPackages}`;
      await new Promise((resolve, error) => {
        exec(
          `npx ${createNextAppCommand.join(' ')} && cd ${toKebabCase(
            this.options.project
          )} && npm install ${additionalPackages}`
        ).on('exit', (code) => {
          this.destinationRoot(
            this.destinationPath(toKebabCase(this.options.project))
          );
          resolve();
        });
      });
    };

    this.installStorybook = function () {
      // Conditionally initialize Storybook
      if (this.options.storybook) {
        this.log('Installing Storybook...');
        this.spawnCommandSync('npx', [
          '-y',
          'storybook@^8.4',
          'init',
          '--no-dev',
        ]);
        this.log('Storybook installed!');
        // if (this.options.tailwind && this.options.storybook) {
        // Tailwind CSS specific setup for older versions of Storybook
        //   this.spawnCommandSync('npx', ['storybook@latest', 'add', '@storybook/addon-styling-webpack']);
        // }
      }
    };

    this.installCypress = function () {
      // Conditionally add Cypress
      if (this.options.cypress) {
        this.log('Installing Cypress...');
        this.spawnCommandSync('npm', ['install', '--save-dev', 'cypress']);
        this.log('Cypress installed!');
        if (this.options.bitloops) {
          this.spawnCommandSync('npm', [
            'install',
            '--save-dev',
            'mochawesome',
            'mochawesome-merge',
            'mochawesome-report-generator',
          ]);
        }
      }
    };

    this.patchFiles = async function () {
      // Conditionally initialize Storybook
      if (this.options.storybook) {
        this.log('Making Storybook changes...');
        if (this.options.tailwind) {
          fs.unlinkSync(this.destinationPath('.storybook/preview.ts'));
          this.log('Setting up Tailwind CSS with Storybook...');
          this.fs.copyTpl(
            this.templatePath('storybook.preview.ts'),
            this.destinationPath('.storybook/preview.ts')
          );
        }
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
        fs.unlinkSync(this.destinationPath('tailwind.config.ts'));
        this.fs.copyTpl(
          this.templatePath('tailwind.config.ts'),
          this.destinationPath('tailwind.config.ts')
        );
      }

      if (this.options.cypress) {
        this.log('Adding Cypress config...');
        this.fs.copyTpl(
          this.templatePath('cypress.config.ts'),
          this.destinationPath('cypress.config.ts')
        );
      }

      fs.unlinkSync(this.destinationPath('src/app/page.tsx'));
      this.fs.copyTpl(
        this.templatePath('next.app.page.tsx'),
        this.destinationPath('src/app/page.tsx')
      );

      fs.unlinkSync(this.destinationPath('src/app/layout.tsx'));
      this.fs.copyTpl(
        this.templatePath('next.app.layout.tsx'),
        this.destinationPath('src/app/layout.tsx'),
        { projectName: this.options.project }
      );

      this.log('Adding Meyer reset in global.css...');
      fs.unlinkSync(this.destinationPath('src/app/globals.css'));
      this.fs.copyTpl(
        this.templatePath('globals.css'),
        this.destinationPath('src/app/globals.css')
      );

      if (this.options.bitloops) {
        this.log('Adding Bitloops support components...');
        const unsupportedPath =
          'src/components/bitloops/unsupported/Unsupported.tsx';
        this.fs.copyTpl(
          this.templatePath(unsupportedPath),
          this.destinationPath(unsupportedPath)
        );
        const buttonPath = 'src/components/bitloops/button/Button.tsx';
        this.fs.copyTpl(
          this.templatePath(buttonPath),
          this.destinationPath(buttonPath)
        );
        if (this.options.storybook) {
          const unsupportedPath =
            'src/components/bitloops/unsupported/Unsupported.stories.tsx';
          this.fs.copyTpl(
            this.templatePath(unsupportedPath),
            this.destinationPath(unsupportedPath)
          );
          const buttonPath =
            'src/components/bitloops/button/Button.stories.tsx';
          this.fs.copyTpl(
            this.templatePath(buttonPath),
            this.destinationPath(buttonPath)
          );
        }
        if (this.options.cypress) {
          const path = 'cypress/helpers/index.ts';
          this.fs.copyTpl(this.templatePath(path), this.destinationPath(path));
        }
        this.spawnCommandSync('npm', [
          'install',
          '--save-dev',
          'react-aria-components',
        ]);
      }
    };

    this.commitChanges = async function () {
      this.log('Committing changes to git...');
      await new Promise((resolve) => {
        exec(
          `cd ${toKebabCase(
            this.options.project
          )} && git add . && git commit -m "Initial setup"`
        ).on('exit', (code) => {
          if (code !== 0) {
            this.log('Error committing changes to git! ', code);
            resolve();
          }
          this.log('Git changes committed!');
          resolve();
        });
      });
    };
  }

  initializing() {
    // Check if the project name and --nextjs flag are provided
    if (!this.options.project) {
      this.log(
        'Error: --project option is required to specify the project name.'
      );
      process.exit(1);
    }

    if (!this.options.nextjs) {
      this.log(
        'Error: --nextjs option is currently required to scaffold a project.'
      );
      process.exit(1);
    }

    this.log(
      `Initializing project ${toKebabCase(
        this.options.project
      )} with the selected options...`
    );
  }

  async main() {
    await this.installNextJS();
    this.installStorybook();
    this.installCypress();
    await this.patchFiles();
    if (this.options.git) {
      await this.commitChanges();
    }
  }

  end() {
    this.log(
      `Your Bitloops project '${toKebabCase(
        this.options.project
      )}' setup is complete! 🎉🎉🎉`
    );
    this.log('');
    this.log('Use the following commands to start:');
    this.log('- `npm run dev` to start the Next.js app.');
    if (this.options.storybook)
      this.log('- `npm run storybook` to start Storybook.');
    if (this.options.cypress)
      this.log('- `npx cypress open --e2e --browser chrome` to open Cypress.');
    if (this.options.cypress)
      this.log(
        '- `npx cypress run --e2e --browser chrome` to run Cypress on the terminal.'
      );
  }
}
