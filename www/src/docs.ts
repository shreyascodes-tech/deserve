import { expandGlob } from "https://deno.land/std@0.152.0/fs/mod.ts";
import { relative } from "https://deno.land/std@0.152.0/path/mod.ts";

import { marked } from "./marked.ts";
import frontMatter from "https://esm.sh/front-matter@4.0.2";

import docsJSON from "../docs.gen.json" assert { type: "json" };

export interface DocAttributes {
  title: string;
}

export interface DocFile {
  attributes: DocAttributes;
  html: string;
}

const genDocsMap = new Map<string, DocFile>(Object.entries(docsJSON));

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

    const { body, attributes } = frontMatter<DocAttributes>(contents);

    const html = marked.parse(body);

    filesMap.set(rel, { attributes, html });
  }

  return filesMap;
}

if (import.meta.main) {
  const docs = await loadDocs(true);
  const json = JSON.stringify(Object.fromEntries(docs.entries()), null, 2);

  await Deno.writeTextFile("./www/docs.gen.json", json);
}
