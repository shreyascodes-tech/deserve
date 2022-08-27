import {
  build,
  stop,
  Plugin,
} from "https://deno.land/x/esbuild@v0.15.5/mod.js";

const file = `import flamethrower from "flamethrower-router";

flamethrower({
  log: false,
  prefetch: "visible",
  pageTransitions: false,
});`;

function flamePlugin(): Plugin {
  return {
    name: "flame",
    setup(build) {
      build.onResolve(
        {
          filter: /flamethrower-router/,
        },
        (args) => {
          return {
            namespace: "flame",
            path: args.path,
          };
        }
      );

      build.onLoad(
        {
          filter: /.*/,
          namespace: "flame",
        },
        async () => {
          const contents = await fetch(
            "https://esm.sh/v92/flamethrower-router/es2022/flamethrower-router.js"
          ).then((r) => r.text());

          return {
            contents,
            loader: "ts",
          };
        }
      );
    },
  };
}

const start = Date.now();
const {
  outputFiles: [{ contents: code }],
} = await build({
  stdin: {
    contents: file,
  },
  write: false,
  bundle: true,
  minify: true,
  plugins: [flamePlugin()],
});

console.log(code.byteLength / 1024 + "kb in " + (Date.now() - start) + "ms");

await Deno.writeFile("./www/public/router.js", code);
stop();
