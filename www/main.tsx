/** @jsx h */
export const dev = !!Deno.env.get("DEV");

import { h } from "https://deno.land/x/htm@0.0.10/mod.tsx";
import { createApp, createLogger, createRouter, serveStatic } from "../mod.ts";

import { createContext } from "./src/context.tsx";

import { Home } from "./pages/Home.tsx";
import { Docs } from "./pages/Docs.tsx";
import { DocsHome } from "./pages/DocsHome.tsx";
import { DocFile } from "./src/docs.ts";
import { codeScript } from "./src/marked.ts";

const port = dev ? 3333 : 80;

const app = createApp(createContext);

const router = createRouter<typeof app>("/");

router.get("/", (_, ctx) => ctx.render(<Home />, { title: "Deserve" }));

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

router.get("/docs{/}?", (_, ctx) =>
  ctx.render(<DocsHome />, {
    title: "Deserve Docs",
  })
);

router.get("/docs/:filename+{/}?", (_, ctx) => {
  const { filename } = ctx.params!;

  const exists = ctx.docsMap.has(filename);
  if (!exists) return ctx.redirect("/docs");

  const docFile: DocFile = ctx.docsMap.get(filename)!;

  return ctx.render(<Docs file={docFile} />, {
    title: docFile.attributes.title,
    styles: [
      {
        href: "https://esm.sh/prismjs@1.27.0/themes/prism-okaidia.min.css",
      },
    ],
    scripts: [codeScript],
  });
});

app
  .hook(createLogger(["/reload"]))
  .use(
    serveStatic({
      fsRoot: "www/public",
    })
  )
  .use(router.routes())
  .listen({
    port,
  });
