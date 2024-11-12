import { Meta, StoryObj } from '@storybook/react';
import { UnsupportedElement, UnsupportedElementProps } from './Unsupported';

const meta: Meta<typeof UnsupportedElement> = {
  title: 'Bitloops/Unsupported',
  component: UnsupportedElement,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

const props: UnsupportedElementProps = {
  type: 'VECTOR',
  elementClassName: 'w-128 h-32',
};

type Story = StoryObj<typeof UnsupportedElement>;

export const Default: Story = {
  args: props,
  parameters: {
    layout: 'fullscreen',
  },
};
