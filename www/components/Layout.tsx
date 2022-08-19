/** @jsx h */
/** @jsxFrag Fragment */
import { h, Fragment } from "https://deno.land/x/htm@0.0.10/mod.tsx";
// deno-lint-ignore no-explicit-any
export function Layout({ children }: { children: any }) {
  return (
    <>
      <main class="w-full min-h-screen text-white bg-[#111827]">
        <header class="bg-[#1f2937] py-2 mb-3 shadow sticky top-0 z-50">
          <div class="container flex flex-col items-center justify-between mx-auto md:flex-row">
            <a
              class="outline-none px-6 py-3 bg-transparent hover:bg-[#00000044] focus:bg-[#00000044] rounded-sm transition-colors duration-150"
              href="/"
            >
              <img src="/logo_wide.png" class="h-[65px]" alt="Deserve Home" />
            </a>
            <ul class="flex text-lg">
              <li>
                <a
                  class="px-8 rounded-t-md outline-none py-3 bg-transparent hover:bg-[#00000044] focus:bg-[#00000044] border-transparent hover:border-white focus:border-white transition-colors duration-150 hover:border-b-2 focus:border-b-2"
                  href="/"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  class="px-8 rounded-t-md outline-none py-3 bg-transparent hover:bg-[#00000044] focus:bg-[#00000044] border-transparent hover:border-white focus:border-white transition-colors duration-150 hover:border-b-2 focus:border-b-2"
                  href="/docs"
                >
                  Docs
                </a>
              </li>
              <li>
                <a
                  class="px-8 rounded-t-md outline-none py-3 bg-transparent hover:bg-[#00000044] focus:bg-[#00000044] border-transparent hover:border-white focus:border-white transition-colors duration-150 hover:border-b-2 focus:border-b-2"
                  href="https://github.com/shreyassanthu77/deserve"
                >
                  Github
                </a>
              </li>
            </ul>
          </div>
        </header>
        <div class="container max-w-[1000px] px-4 mx-auto">{children}</div>
      </main>
    </>
  );
}
