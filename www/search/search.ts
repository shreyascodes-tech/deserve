import Fuse from "https://esm.sh/fuse.js@6.6.2";
import { options } from "./shared.ts";

import docs from "./docs.json" assert { type: "json" };
import indexJSON from "./index.json" assert { type: "json" };

export function createSearch() {
  const index = Fuse.parseIndex(indexJSON);

  const fuse = new Fuse<{
    path: string;
    body: string;
    attributes: {
      title: string;
    };
  }>(docs, options, index);

  return function search(pattern: string) {
    return fuse.search(pattern);
  };
}
