/** @jsx h */
import {
  h,
  VNode,
  Options as HTMLOPts,
  html,
} from "https://deno.land/x/htm@0.0.10/mod.tsx";
import { UnoCSS } from "https://deno.land/x/htm@0.0.10/plugins.ts";
import { presetUno } from "https://esm.sh/@unocss/preset-uno@0.45.7";
import { presetTypography } from "https://esm.sh/@unocss/preset-typography@0.45.7";

import { dev } from "../main.tsx";
import { DocFile, loadDocs } from "./docs.ts";

const devScript = `addEventListener('DOMContentLoaded', (event) => setInterval(() => fetch("/reload").then(r => r.json()).then(({ reload }) => reload && location.reload()), 500));`;

let docsMap: Map<string, DocFile>;

let init = false;

export async function createContext() {
  if (!init) {
    html.use(
      UnoCSS({
        presets: [
          // @ts-ignore ..
          presetUno({}),
          // @ts-ignore ..
          presetTypography({}),
        ],
        safelist: [],
      })
    );

    docsMap = await loadDocs(dev);
    init = true;
  }

  return {
    docsMap,
    render(
      // deno-lint-ignore ban-types
      body: VNode<{}>,
      { scripts, styles, ...opts }: Partial<HTMLOPts> = {}
    ) {
      return html({
        lang: "en",
        scripts: [
          {
            src: "/router.js",
          },
          ...(dev ? [devScript] : []),
          ...(scripts ? scripts : []),
        ],
        styles: [
          `* { -webkit-tap-highlight-color: transparent; } body { height: 100vh; display: flex; flex-direction: column; }`,
          ...(styles ? styles : []),
        ],
        body,
        ...opts,
      });
    },
  };
}
