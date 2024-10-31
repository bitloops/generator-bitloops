import Generator from 'yeoman-generator';

export default class extends Generator {
  constructor(args, opts) {
    // Calling the super constructor is important so our generator is correctly set up
    super(args, opts);

    // Next, add your custom code
    this.option('next'); // This method adds support for a `--next` flag
    this.option('typescript'); // This method adds support for a `--typescript` flag
    this.option('tailwind'); // This method adds support for a `--tailwind` flag
    this.option('storybook'); // This method adds support for a `--storybook` flag
    this.option('cypress'); // This method adds support for a `--cypress` flag
  }

  message() {
    this.log('You need to select a sub-method. E.g. `npx yo bitloops:setup`');
  }

};
