import Fuse from "https://esm.sh/fuse.js@6.6.2";

// deno-lint-ignore ban-types
export const options: Fuse.IFuseOptions<{}> = {
  includeScore: true,
  isCaseSensitive: false,
  ignoreLocation: true,
  keys: [
    { name: "attributes.title", weight: 0.6 },
    { name: "body", weight: 0.4 },
    { name: "path", weight: 0.2 },
  ],
};
