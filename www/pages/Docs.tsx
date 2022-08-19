/** @jsx h */
import { h } from "https://deno.land/x/htm@0.0.10/mod.tsx";
import { Prose } from "../components/Prose.tsx";
import type { DocFile } from "../src/docs.ts";

export interface DocsProps {
  file: DocFile;
}

export function Docs({ file: { html } }: DocsProps) {
  return <Prose html={html} />;
}
