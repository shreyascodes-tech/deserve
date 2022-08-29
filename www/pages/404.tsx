/** @jsx h */
/** @jsxFrag Fragment */
import { h, Fragment, Head, Res } from "../../utils/jsx/mod.ts";
import { Layout } from "../components/Layout.tsx";

export function NotFound({ from = "" }) {
  return (
    <Layout>
      <Head>
        <Res status={404} />
        <title>Not Found</title>
      </Head>
      <img src="/404.svg" alt="You Are Offline" class="w-80 mx-auto mt-12" />
      <h1 class="text-center mt-12 text-4xl font-bold">
        Oops! Page {from === "" ? "You Are Looking For is" : from} Not found
      </h1>
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
