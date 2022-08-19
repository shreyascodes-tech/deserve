/** @jsx h */
/** @jsxFrag Fragment */
import { h, Fragment } from "https://deno.land/x/htm@0.0.10/mod.tsx";
import { Prose } from "../components/Prose.tsx";
export function DocsHome() {
  return (
    <Prose>
      <h1>Documentation</h1>

      <h2>Quick Start</h2>
      <p>Get started with deserve in a few minutes</p>
      <a
        href="/docs/quick-start"
        class="block max-w-max px-4 py-2 rounded bg-sky-600 no-underline"
      >
        Get Started
      </a>
    </Prose>
  );
}
