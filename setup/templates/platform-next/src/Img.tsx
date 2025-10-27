'use client';
import NextImage from 'next/image';
import type { ImgProps } from './types';
export function Img(props: ImgProps) {
  const { responsive, ...rest } = props;
  return <NextImage {...rest} />;
}