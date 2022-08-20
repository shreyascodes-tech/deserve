/** @jsx h */
import {
  h,
  ComponentProps,
  ComponentType,
} from "https://deno.land/x/htm@0.0.10/mod.tsx";

export interface ProseProps {
  html?: string;
}

export function Prose({
  children,
  html,
  class: clss,
  ...rest
}: ComponentProps<
  ComponentType<h.JSX.HTMLAttributes<HTMLDivElement> & ProseProps>
>) {
  return (
    <div
      class={`text-lg prose prose-neutral prose-invert max-w-full ${
        " " + clss ?? ""
      }`}
      {...rest}
      dangerouslySetInnerHTML={html ? { __html: html } : undefined}
    >
      {!html && children}
    </div>
  );
}
