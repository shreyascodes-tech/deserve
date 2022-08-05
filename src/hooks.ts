import {
  brightBlue,
  brightGreen,
  brightYellow,
} from "https://deno.land/std@0.151.0/fmt/colors.ts";
import { Hook } from "./types.ts";
import { useURL } from "./utils.ts";

export function createLogger(): Hook {
  let start: number;

  return {
    initial: () => {
      start = Date.now();
    },
    final: (req) => {
      const { pathname } = useURL(req);
      const time = Date.now() - start;
      console.log(
        `${brightGreen(req.method)} | ${brightYellow(pathname)} - ${brightBlue(
          `${time}ms`
        )}`
      );
    },
  };
}
