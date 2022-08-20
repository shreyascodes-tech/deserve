/** @jsx h */
/** @jsxFrag Fragment */
import { h, Fragment } from "https://deno.land/x/htm@0.0.10/mod.tsx";
import { Layout } from "../components/Layout.tsx";
import { Prose } from "../components/Prose.tsx";
import SideBar from "../components/SideBar.tsx";
export function DocsHome() {
  return (
    <Layout sideBar={<SideBar />}>
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
        <h2>API Reference</h2>
        <p>Dive Deep Into the types and functions of the library</p>
        <a
          href="https://doc.deno.land/https://deno.land/x/deserve/mod.ts"
          class="block max-w-max px-4 py-2 rounded border-2 border-text-sky-600 text-sky-600 no-underline"
        >
          API Reference
        </a>
      </Prose>
    </Layout>
  );
}
