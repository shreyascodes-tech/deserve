// import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import convert from "https://esm.sh/html2plaintext";
import Fuse from "https://esm.sh/fuse.js@6.6.2";
import { options } from "./shared.ts";

import { loadDocs } from "../docs.ts";
import { brightGreen } from "https://deno.land/std@0.152.0/fmt/colors.ts";

const docsEntries = await loadDocs(true);

// const parser = new DOMParser();
const docs = Array.from(docsEntries).map(([path, { html, ...doc }]) => {
  //   const document = parser.parseFromString(html, "text/html");
  const body = convert(html, {
    preserveNewlines: false,
  });
  return {
    path,
    body,
    ...doc,
  };
});

// console.log(docs.slice(0, 2));

const docsJson = JSON.stringify(docs);

const index = Fuse.createIndex(options.keys!, docs);

const indexStr = JSON.stringify(index.toJSON());

await Deno.writeTextFile("www/search/docs.json", docsJson);
await Deno.writeTextFile("www/search/index.json", indexStr);

// const fuse = new Fuse(docs, options, index);

// console.log(fuse.search("Context"));
console.log(brightGreen("✅ Build Successful"));
