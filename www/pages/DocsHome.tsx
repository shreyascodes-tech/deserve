/** @jsx h */
/** @jsxFrag Fragment */
import { h, Head } from "../../utils/jsx/mod.ts";
import { Layout } from "../components/Layout.tsx";
import { Prose } from "../components/Prose.tsx";
import SideBar from "../components/SideBar.tsx";
export function DocsHome() {
  return (
    <Layout sideBar={<SideBar path="/docs" />}>
      <Head>
        <title>Deserve Docs</title>
      </Head>
      <Prose>
        <h1>Documentation</h1>
        <h2>Quick Start</h2>
        <p>Get started with deserve in a few minutes</p>
        <a
          class="px-4 py-2 rounded outline-none transition-colors no-underline
          border-2 text-emerald-400 border-emerald-400
          hover:text-white hover:bg-emerald-600 hover:border-emerald-600
          focus:text-white focus:bg-emerald-600 focus:border-emerald-600
          active:text-white active:bg-emerald-700 active:border-emerald-700"
          href="/docs/quick-start"
        >
          Get Started
        </a>
        <h2>API Reference</h2>
        <p>Dive Deep Into the types and functions of the library</p>
        <a
          class="px-4 py-2 rounded outline-none transition-colors no-underline
          border-2 text-emerald-400 border-emerald-400
          hover:text-white hover:bg-emerald-600 hover:border-emerald-600
          focus:text-white focus:bg-emerald-600 focus:border-emerald-600
          active:text-white active:bg-emerald-700 active:border-emerald-700"
          href="https://doc.deno.land/https://deno.land/x/deserve/mod.ts"
        >
          API Reference
        </a>
      </Prose>
    </Layout>
  );
}
