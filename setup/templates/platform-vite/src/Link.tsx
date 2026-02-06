import type { LinkProps } from "../../src/lib/types/primitives.types";

export function Link(props: LinkProps) {
  const { href, children, target, rel, className, style, onClick } = props;

  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={className}
      style={style}
      onClick={onClick}
      aria-label={props["aria-label"]}
    >
      {children}
    </a>
  );
}
