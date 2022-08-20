/** @jsx h */
import { h } from "https://deno.land/x/htm@0.0.10/mod.tsx";
import { Layout } from "../components/Layout.tsx";
import { Prose } from "../components/Prose.tsx";

export function Home() {
  return (
    <Layout>
      <Prose>
        <h1>Deserve</h1>
        <h4>
          A simple, light weight, blazingly Fast server library for{" "}
          <a class="text-blue-400" href="https://deno.land/">
            Deno
          </a>
        </h4>
        <p>
          Checkout the{" "}
          <a href="/docs/quick-start" className="text-blue-400">
            Quick Start
          </a>{" "}
          Guide to get started
        </p>
        <h4>More Docs Coming soon...</h4>
      </Prose>
    </Layout>
  );
}
