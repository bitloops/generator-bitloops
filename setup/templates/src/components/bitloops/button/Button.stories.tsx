import { Meta, StoryObj } from '@storybook/react';
import { ButtonElement, ButtonElementProps } from './Button';

const meta: Meta<typeof ButtonElement> = {
  title: 'Bitloops/Button',
  component: ButtonElement,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

const props: ButtonElementProps = {
  disabled: false,
  onPress: () => {
    console.log('Button pressed');
  },
  className:
    'border-purple-700 bg-purple-700 border opacity-100 w-40 flex-col items-center border-solid',
  children: (
    <p className='text-white opacity-100 text-lg font-mono'>Hello World!</p>
  ),
};

type Story = StoryObj<typeof ButtonElement>;

export const Default: Story = {
  args: props,
  parameters: {
    layout: 'fullscreen',
  },
};
