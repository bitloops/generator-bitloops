"use client";
import NextLink from "next/link";
import type { LinkProps } from "../../src/lib/types/primitives.types";
export function Link(props: LinkProps) {
  return <NextLink {...props} />;
}
