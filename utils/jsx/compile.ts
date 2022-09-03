import * as esbuild from "https://deno.land/x/esbuild@v0.14.51/wasm.js";
import { denoPlugin } from "https://deno.land/x/esbuild_deno_loader@0.5.2/mod.ts";

if (!window.Worker) {
  esbuild.initialize({
    worker: false,
  });
}

export function buildFile(path: string) {
  return esbuild
    .build({
      entryPoints: [path],
      plugins: [denoPlugin()],
      bundle: true,
      minify: true,
      write: false,
      format: "iife",
    })
    .then((res) => res.outputFiles[0].text);
}

export * from "https://deno.land/x/esbuild@v0.14.51/mod.js";
