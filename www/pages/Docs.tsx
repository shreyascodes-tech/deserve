/** @jsx h */
import { h } from "https://deno.land/x/htm@0.0.10/mod.tsx";
import { Layout } from "../components/Layout.tsx";
import { Prose } from "../components/Prose.tsx";
import SideBar from "../components/SideBar.tsx";
import type { DocFile } from "../src/docs.ts";

export interface DocsProps {
  file: DocFile;
}

export function Docs({
  file: {
    html,
    attributes: { prev, next },
  },
}: DocsProps) {
  console.log(prev, next);

  return (
    <Layout sideBar={<SideBar />}>
      <Prose html={html} />
    </Layout>
  );
}
