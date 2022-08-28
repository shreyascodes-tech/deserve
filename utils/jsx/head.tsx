/** @jsx h */
/** @jsxFrag Fragment */
import { h, ComponentChildren, createContext, useContext } from "./preact.ts";

export interface HeadProps {
  children: ComponentChildren;
}

export const HEAD_CTX = createContext<ComponentChildren[]>([]);

export function Head(props: HeadProps) {
  const head = useContext(HEAD_CTX);
  head.push(props.children);
  return null;
}
