import {
  createApp,
  createLogger,
  createRouter,
  response,
  serveStatic,
} from "./mod.ts";

const app = createApp();

const router = createRouter("/todos")
  .get("/", () => response("All Todos"))
  .get("/:id", (_, ctx) => {
    const id = ctx.params!.id;
    return response(`get todo ${id}`);
  })
  .post("/:id", (_, ctx) => {
    const id = ctx.params!.id;
    return response(`create todo ${id}`);
  })
  .put("/:id", (_, ctx) => {
    const id = ctx.params!.id;
    return response(`override todo ${id}`);
  })
  .patch("/:id", (_, ctx) => {
    const id = ctx.params!.id;
    return response(`update todo ${id}`);
  })
  .delete("/:id", (_, ctx) => {
    const id = ctx.params!.id;
    return response(`delete todo ${id}`);
  });

app
  .hook(createLogger())
  .use("/*?", serveStatic({ fsRoot: "./public", serveIndex: true }))
  .use(router.routes())
  .listen({ port: 3333 });
