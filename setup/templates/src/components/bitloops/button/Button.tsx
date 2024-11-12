import { Button as AriaButton } from 'react-aria-components';

export type ButtonElementProps = {
  name?: string;
  disabled?: boolean;
  onPress: (e?: unknown) => void;
  children?: React.ReactNode;
  className?: string;
};
export function ButtonElement(props: ButtonElementProps) {
  const { name, disabled, children, className, onPress } = props;
  return (
    <AriaButton
      name={name}
      isDisabled={disabled}
      onPress={onPress}
      className={className}
    >
      {children}
    </AriaButton>
  );
}
