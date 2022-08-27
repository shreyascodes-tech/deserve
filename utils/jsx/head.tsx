/** @jsx h */
/** @jsxFrag Fragment */
import { h, ComponentChildren } from "./preact.ts";
import { atom } from "https://esm.sh/nanostores@0.6.0";

export interface HeadProps {
  children: ComponentChildren;
}

export const HEAD_ATOM = atom<ComponentChildren[]>([]);

export function Head(props: HeadProps) {
  const head = HEAD_ATOM.get();
  HEAD_ATOM.set([...head, props.children]);
  return null;
}
