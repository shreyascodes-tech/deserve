import * as esbuild from "https://deno.land/x/esbuild@v0.14.51/wasm.js";
import { denoPlugin } from "https://deno.land/x/esbuild_deno_loader@0.5.2/mod.ts";

if (Deno.run === undefined) {
  await esbuild.initialize({
    wasmURL: "https://deno.land/x/esbuild@v0.14.51/esbuild.wasm",
    worker: false,
  });
} else {
  await esbuild.initialize({});
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
