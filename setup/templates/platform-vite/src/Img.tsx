/* eslint-disable @next/next/no-img-element */
import type { ImgProps } from "../../src/lib/types/primitives.types";

export function Img(props: ImgProps) {
  const { src, alt, className, style, loading, decoding } =
    props;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading={loading}
      decoding={decoding}
    />
  );
}
