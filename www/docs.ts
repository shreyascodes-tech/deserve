import { expandGlob } from "https://deno.land/std@0.152.0/fs/mod.ts";
import { relative } from "https://deno.land/std@0.152.0/path/mod.ts";

import docsJSON from "./docs.gen.json" assert { type: "json" };

import { renderMd } from "../utils/md/mod.ts";

export interface DocAttributes {
  title: string;
  next?: [string, string];
  prev?: [string, string];
}

export interface DocFile {
  attributes: DocAttributes;
  html: string;
}

// deno-lint-ignore no-explicit-any
const genDocsMap = new Map<string, DocFile>(Object.entries(docsJSON) as any);

export async function loadDocs(dev = false) {
  if (!dev) {
    return genDocsMap;
  }

  const path = "./www/docs/**/*.md";
  const files = expandGlob(path);

  const filesMap = new Map<string, DocFile>();

  for await (const { path } of files) {
    const rel = relative("./www/docs", path)
      .replace(".md", "")
      .replaceAll("\\", "/");

    const contents = await Deno.readTextFile(path);

    const { html, attributes } = renderMd<DocAttributes>(contents);

    filesMap.set(rel, { attributes, html });
  }

  return filesMap;
}

if (import.meta.main) {
  const docs = await loadDocs(true);
  const json = JSON.stringify(Object.fromEntries(docs.entries()), null, 2);

  await Deno.writeTextFile("./www/docs.gen.json", json);
}
