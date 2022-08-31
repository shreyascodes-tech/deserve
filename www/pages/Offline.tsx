/** @jsx h */
/** @jsxFrag Fragment */
import { h, Fragment, Head, Res } from "../../utils/jsx/mod.ts";
import { Layout } from "../components/Layout.tsx";

export function Offline({ from = "" }) {
  return (
    <Layout>
      <Head>
        <title>You're Offline</title>
      </Head>
      <img
        src="/offline.svg"
        alt="You Are Offline"
        class="w-80 mx-auto mt-12"
      />
      <h1 class="text-center mt-12 text-4xl font-bold">Oops! You're Offline</h1>
      <div class="text-center mt-10">
        <a
          class="px-6 py-3 rounded transition-colors bg-white/10 hover:bg-white/40 focus:bg-white/30 active:bg-white/60"
          href="/"
        >
          Go Home
        </a>
      </div>
    </Layout>
  );
}
