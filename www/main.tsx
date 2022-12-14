/** @jsx h */
/** @jsxFrag Fragment */
import { h, Fragment, VNode, createJSX, Head } from "../utils/jsx/mod.ts";

import { UnoGenerator } from "https://esm.sh/@unocss/core@0.45.7";
import { presetUno } from "https://esm.sh/@unocss/preset-uno@0.45.7";
import { presetTypography } from "https://esm.sh/@unocss/preset-typography@0.45.7";

import { DocFile, loadDocs } from "./docs.ts";
import {
  createApp,
  createRouter,
  createLogger,
  serveStatic,
  json,
} from "../mod.ts";
import { Home } from "./pages/Home.tsx";
import { DocsHome } from "./pages/DocsHome.tsx";
import { Docs } from "./pages/Docs.tsx";
import { NotFound } from "./pages/404.tsx";
import { createSearch } from "./search/search.ts";
import { buildFile, stop } from "../utils/esbuild/mod.ts";
import { response } from "../lib/utils.ts";

const unoResetCSS = `/* reset */
*,:before,:after{box-sizing:border-box;border:0 solid}html{-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;line-height:1.5}body{line-height:inherit;margin:0}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-size:1em}small{font-size:80%}sub,sup{vertical-align:baseline;font-size:75%;line-height:0;position:relative}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button;background-color:#0000;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{margin:0;padding:0;list-style:none}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{vertical-align:middle;display:block}img,video{max-width:100%;height:auto}
`;

const jsx = (() => {
  const uno = new UnoGenerator({
    // deno-lint-ignore no-explicit-any
    presets: [presetUno({}) as any, presetTypography({})],
  });

  return createJSX({
    async transform(ctx) {
      const { css } = await uno.generate(ctx.body);
      ctx.head.children.push(
        <style dangerouslySetInnerHTML={{ __html: css }} />
      );
    },
  });
})();

const dev = !!Deno.env.get("DEV");
const devScript = `addEventListener('DOMContentLoaded', (event) => setInterval(() => fetch("/reload").then(r => r.json()).then(({ reload }) => reload && location.reload()), 500));`;

const docsMap = await loadDocs(dev);

function createContext() {
  return {
    docsMap,
    render(
      // deno-lint-ignore ban-types
      body: VNode<{}>
    ) {
      return jsx(
        <>
          <Head>
            <link rel="apple-touch-icon" href="/logo.png" />
            <link rel="icon" href="/logo.png" />
            <link rel="manifest" href="/manifest.webmanifest" />
            <style
              dangerouslySetInnerHTML={{
                __html:
                  unoResetCSS +
                  `* { -webkit-tap-highlight-color: transparent; } body { height: 100vh; display: flex; flex-direction: column; }`,
              }}
            />
            <script src="/router.js"></script>
            {dev && <script dangerouslySetInnerHTML={{ __html: devScript }} />}
          </Head>
          {body}
        </>
      );
    },
  };
}

const port = dev ? 3333 : 80;

const app = createApp(createContext);

const router = createRouter<typeof app>("/");

router.get("/", (_, ctx) => ctx.render(<Home />));
router.get("/404{/}?*", (req, ctx) =>
  ctx.render(
    <NotFound from={new URL(req.url).searchParams.get("from") ?? undefined} />
  )
);

// Dev Reload Route
{
  let reload = true;
  if (dev) {
    router.get("/reload", () => {
      if (!reload) return Response.json({ reload });
      reload = false;
      return Response.json({ reload: true });
    });
  }
}

router.get("/docs{/}?", (_, ctx) => ctx.render(<DocsHome />));
router.get("/search.client.js", async (req, ctx) => {
  const js = await buildFile(
    import.meta.resolve("./components/search.client.tsx")
  );
  return response(js, {
    headers: [["Content-type", "application/javascript"]],
  });
});

const searchDocs = createSearch();
router.post("/docs/search{/}?", async (req, ctx) => {
  const { query } = await req.json();
  const results = searchDocs(query);
  return json(
    results.map(
      ({
        item: {
          path,
          attributes: { title },
        },
        score,
      }) => ({ path, title, score })
    )
  );
});

router.get("/docs/:filename+{/}?", (req, ctx) => {
  const { filename } = ctx.params!;

  const exists = ctx.docsMap.has(filename);
  if (!exists) return ctx.redirect("/docs");

  const docFile: DocFile = ctx.docsMap.get(filename)!;

  return ctx.render(<Docs path={new URL(req.url).pathname} file={docFile} />);
});

await app
  .hook(createLogger(["/reload"]))
  .use(
    serveStatic({
      fsRoot: "www/public",
    })
  )
  .use(router.routes())
  .use((req, ctx) => ctx.redirect(`/404?from=${new URL(req.url).pathname}`))
  .listen({
    port,
  });

stop();
