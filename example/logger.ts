import { createServer, createRouter, createLogger } from "../mod.ts";

const server = createServer().useHook(createLogger());

const router = createRouter({ server });

router.get("/", () => {
  console.log("Hello World!");

  return Response.json({
    message: "Hello World!",
  });
});
router.get<{
  data: string;
}>(
  "/hi/:name",
  (event) => {
    event.state.data = "Hello " + event.params.name;
  },
  (event) => {
    return Response.json({
      message: event.state.data,
    });
  }
);

server.listen({ port: 5050 });
