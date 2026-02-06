"use client";
import NextImage from "next/image";
import type { ImgProps } from "../../src/lib/types/primitives.types";

export function Img(props: ImgProps) {
  const { ...rest } = props;
  return <NextImage {...rest} />;
}
