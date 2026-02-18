// shared types (export them from both adapters)
export type ImgProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  className?: string;
  style?: React.CSSProperties;
  loading?: "eager" | "lazy";
  decoding?: "auto" | "sync" | "async";
  responsive?: { sources: Array<{ media: string; srcSet: string }> }; // optional <picture>
};

export type LinkProps = {
  href: string;
  children: React.ReactNode;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  "aria-label"?: string;
};

export type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  "aria-label"?: string;
};

export type MetaProps = {
  title?: string;
  description?: string;
  lang?: string;
  openGraph?: {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
  };
  twitter?: {
    card?: string;
    title?: string;
    description?: string;
    image?: string;
  };
  icons?: { icon?: string; apple?: string };
};

export type FontSpec =
  | { kind: "next"; fonts: Array<{ variable: string; loader: () => unknown }> } // Next native loaders
  | { kind: "css"; hrefs: string[]; className?: string };
