import fs from 'fs';
import { exec } from 'child_process';
import Generator from 'yeoman-generator';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert `import.meta.url` to a path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


function toKebabCase(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase().replace(/\s+/g, '-');
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

    this.installNextJS = async function() {
      // Clone Next.js template with Tailwind if specified, using the project name
      const createNextAppCommand = ['-y', 'create-next-app@latest'];
      createNextAppCommand.push(toKebabCase(this.options.project)); // Use the project name for the directory
      createNextAppCommand.push('--app');
      createNextAppCommand.push('--empty');
      createNextAppCommand.push('--src-dir');
      if (this.options.storybook) {
        // Disable TurboPack for Storybook compatibility given the Next.js downgrade that will follow
        createNextAppCommand.push('--no-turbopack');
      } else {
        createNextAppCommand.push('--turbopack'); 
      }
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
      
      this.log("Installing Next.js...");
      const additionalPackages = 'react-tooltip';
      const patchPackages = `next@14 react@18 react-dom@18 ${additionalPackages}`;
      await new Promise((resolve, error) => {exec(`npx ${createNextAppCommand.join(' ')} && cd ${toKebabCase(this.options.project)} && npm install ${patchPackages}`).on('exit', (code) => {
        this.destinationRoot(this.destinationPath(toKebabCase(this.options.project)));
        resolve();
      });});
    }

    this.installStorybook = function() {    
      // Conditionally initialize Storybook
      if (this.options.storybook) {
        this.log("Adding Storybook...");
        this.spawnCommandSync('npx', ['-y', 'storybook@7.4', 'init', '--no-dev']);
        // if (this.options.tailwind) {
        // Tailwind CSS specific setup if needed
        //   this.spawnCommandSync('npx', ['storybook@latest', 'add', '@storybook/addon-styling-webpack']);
        // }
      }
    }
  
    this.installCypress = function() {    
      // Conditionally add Cypress
      if (this.options.cypress) {
        this.log("Adding Cypress...");
        this.spawnCommandSync('npm', ['install', '--save-dev', 'cypress']);
      }
    }
  
    this.patchFiles = async function() {
      if (this.options.storybook) {
        if (this.options.typescript) {
          this.log('Replace Next.js\' TypeScript configuration file with JS...');
          // Remove TypeScript configuration files given they require Next.js 15
          try {
            fs.unlinkSync(this.destinationPath('next.config.ts'));
            this.log(`Deleted next.config.ts`);
          } catch (err) {
            console.error('Error deleting next.config.ts:', err);
          }
          this.fs.copyTpl(
            this.templatePath('next.config.js'),
            this.destinationPath('next.config.js'),
          );
          this.log(`Created next.config.js instead`);
        }
      }
  
      // Conditionally initialize Storybook
      if (this.options.storybook) {
        this.log("Making Storybook changes...");
        if (this.options.tailwind) {
          fs.unlinkSync(this.destinationPath('.storybook/preview.ts'));
          this.log('Setting up Tailwind CSS with Storybook...');
          this.fs.copyTpl(
            this.templatePath('storybook.preview.ts'),
            this.destinationPath('.storybook/preview.ts'),
          );  
        }
        this.log('Removing default Storybook stories...');
        try {
          fs.rmSync(this.destinationPath('src/stories'), { recursive: true, force: true });
          console.log('Sample stories directory deleted successfully!');
        } catch (err) {
            console.error('Error deleting sample stories directory:', err);
        }
        fs.unlinkSync(this.destinationPath('tailwind.config.ts'));
        this.fs.copyTpl(
          this.templatePath('tailwind.config.ts'),
          this.destinationPath('tailwind.config.ts'),
        );
      }
  
      if (this.options.cypress) {
        this.log("Adding Cypress config...");
        this.fs.copyTpl(
          this.templatePath('cypress.config.ts'),
          this.destinationPath('cypress.config.ts'),
        ); 
      }
  
      fs.unlinkSync(this.destinationPath('src/app/page.tsx'));
      this.fs.copyTpl(
        this.templatePath('next.app.page.tsx'),
        this.destinationPath('src/app/page.tsx'),
      ); 
  
      fs.unlinkSync(this.destinationPath('src/app/layout.tsx'));
      this.fs.copyTpl(
        this.templatePath('next.app.layout.tsx'),
        this.destinationPath('src/app/layout.tsx'),
        { projectName: this.options.project },
      );
      
      this.log('Adding Meyer reset in global.css...');
      fs.unlinkSync(this.destinationPath('src/app/globals.css'));
      this.fs.copyTpl(
        this.templatePath('globals.css'),
        this.destinationPath('src/app/globals.css'),
      ); 

      this.log('Adding Bitloops support components...');
      this.fs.copyTpl(
        this.templatePath('src.components.bitloops.Unsupported.tsx'),
        this.destinationPath('src/components/bitloops/Unsupported.tsx'),
      ); 
      if (this.options.storybook) {
        this.fs.copyTpl(
          this.templatePath('src.components.bitloops.Unsupported.stories.tsx'),
          this.destinationPath('src/components/bitloops/Unsupported.stories.tsx'),
        ); 
      }
    }
  }

  initializing() {
    // Check if the project name and --nextjs flag are provided
    if (!this.options.project) {
      this.log("Error: --project option is required to specify the project name.");
      process.exit(1);
    }

    if (!this.options.nextjs) {
      this.log("Error: --nextjs option is currently required to scaffold a project.");
      process.exit(1);
    }

    this.log(`Initializing project ${toKebabCase(this.options.project)} with the selected options...`);
  }  

  async main() {
    await this.installNextJS();
    this.log('Installing Storybook');
    this.installStorybook();
    this.log('Installing Cypress');
    this.installCypress();
    this.log('Patching files');
    await this.patchFiles();
  }

  end() {
    this.log(`Your Bitloops project '${toKebabCase(this.options.project)}' setup is complete! 🎉🎉🎉`); 
    this.log('');
    this.log('Use the following commands to start:');
    this.log("- `npm run dev` to start the Next.js app.");
    if (this.options.storybook) this.log("- `npm run storybook` to start Storybook.");
    if (this.options.cypress) this.log("- `npx cypress open --e2e --browser chrome` to open Cypress.");
    if (this.options.cypress) this.log("- `npx cypress run --e2e --browser chrome` to run Cypress on the terminal.");
  }
};
