/** @jsx h */
/** @jsxFrag Fragment */
import {
  h,
  Fragment,
  ComponentProps,
  ComponentType,
  ComponentChildren,
  VNode,
} from "https://deno.land/x/htm@0.0.10/mod.tsx";

export interface LayOutProps {
  // deno-lint-ignore ban-types
  sideBar?: VNode<{}>;
  children: ComponentChildren;
}

export function Layout({
  children,
  sideBar,
}: ComponentProps<ComponentType<LayOutProps>>) {
  return (
    <>
      <main class="w-full h-screen overflow-y-hidden text-white bg-[#111827]">
        <header class="bg-[#1f2937] py-2 shadow">
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
                  href="https://github.com/shreyascodes-tech/deserve"
                >
                  Github
                </a>
              </li>
            </ul>
          </div>
        </header>
        <div class="w-full h-full overflow-y-auto">
          <div
            class={`container ${sideBar ? "flex gap-x-6" : ""} max-w-[${
              sideBar ? 1400 : 1000
            }px] px-4 mx-auto`}
          >
            {sideBar && (
              <aside class="h-full pt-3 sticky top-0 w-[260px] hidden md:block">
                {sideBar}
              </aside>
            )}
            <div class="w-full">{children}</div>
          </div>
        </div>
      </main>
    </>
  );
}
