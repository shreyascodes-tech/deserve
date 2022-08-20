/** @jsx h */
import { h } from "https://deno.land/x/htm@0.0.10/mod.tsx";
import { Layout } from "../components/Layout.tsx";
import { Prose } from "../components/Prose.tsx";
import SideBar from "../components/SideBar.tsx";
import type { DocAttributes, DocFile } from "../src/docs.ts";

export interface DocsProps {
  file: DocFile;
}

function PaginatedLink({
  title,
  path,
  next = false,
}: {
  title: string;
  path: string;
  next?: boolean;
}) {
  return (
    <a
      class="outline-none flex items-center rounded-full gap-x-4 px-12 p-6 border-2 border-neutral-300 text-neutral-300 hover:text-white hover:border-white focus:text-white ring-2 ring-transparent focus:ring-sky-400 transition-colors"
      href={path}
    >
      {!next && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
      )}
      <span class="font-bold">{title}</span>
      {next && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14 5l7 7m0 0l-7 7m7-7H3"
          />
        </svg>
      )}
    </a>
  );
}

function Pagination({
  attributes: { prev, next },
}: {
  attributes: DocAttributes;
}) {
  return (
    <div
      class={`pt-4 pb-8 flex flex-wrap justify-center gap-y-4 md:${
        prev && next ? "justify-between" : "justify-center"
      }`}
    >
      {prev && <PaginatedLink path={prev[0]} title={prev[1]} />}
      {next && <PaginatedLink next path={next[0]} title={next[1]} />}
    </div>
  );
}

export function Docs({ file: { html, attributes } }: DocsProps) {
  return (
    <Layout sideBar={<SideBar />}>
      <Prose html={html} />
      <Pagination attributes={attributes} />
    </Layout>
  );
}
