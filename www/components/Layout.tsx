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

const links: ([string, string] | [string, VNode, string])[] = [
  // ["/", "Home"],
  ["/docs", "Docs"],
  ["https://doc.deno.land/https://deno.land/x/deserve/mod.ts", "API Reference"],
  [
    "https://github.com/shreyascodes-tech/deserve",
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    </>,
    "Github",
  ],
];

function Header({ hasSidebar = false }) {
  return (
    <header class="bg-[#1f2937] py-2 border-b-1 border-white/20 text-white">
      <div class="container flex flex-col items-center justify-between mx-auto md:flex-row">
        <a
          class="outline-none px-6 py-3 bg-transparent hover:bg-white/25 focus:bg-white/25 rounded-sm transition-colors"
          href="/"
        >
          <img
            src="/logo_wide.png"
            class="h-10 object-contain"
            alt="Deserve Home"
          />
        </a>
        <ul class="flex text-sm items-center max-w-full overflow-x-auto">
          {hasSidebar && (
            <li>
              <button
                class="block lg:hidden px-6 py-2 bg-transparent hover:bg-white/25 focus:bg-white/25 active:bg-white/25 transition-colors rounded-full"
                type="button"
                title="Open Menu"
                data-sidebar-toggle
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h8m-8 6h16"
                  />
                </svg>
              </button>
            </li>
          )}
          {links.map(([path, child, title]) => (
            <li>
              <a
                class={`block px-6 py-2 text-center bg-transparent hover:bg-white/25 focus:bg-white/25 active:bg-white/25 transition-colors ${
                  typeof child === "string" ? "rounded-md" : "rounded-full"
                }`}
                title={title}
                href={path}
              >
                {child}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}

export function Layout({
  children,
  sideBar,
}: ComponentProps<ComponentType<LayOutProps>>) {
  return (
    <>
      <Header hasSidebar={!!sideBar} />
      <div class="bg-[#111827] w-full">
        <strong class="bg-amber-500/10 flex justify-center items-center gap-x-3 px-3 py-4 border-b-1 border-amber-200/75 text-amber-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 10.5v3.75m-9.303 3.376C1.83 19.126 2.914 21 4.645 21h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 4.88c-.866-1.501-3.032-1.501-3.898 0L2.697 17.626zM12 17.25h.007v.008H12v-.008z"
            />
          </svg>
          Deserve is Still in its early stages, expect breaking changes
        </strong>
      </div>
      <div class="w-full h-full md:h-full text-white overflow-y-auto bg-[#111827]">
        <div
          class={`container min-h-full ${
            sideBar ? "flex gap-x-6" : ""
          } max-w-[${sideBar ? 1400 : 1000}px] px-4 mx-auto`}
        >
          {sideBar && (
            <aside
              id="sidebar"
              class="opacity-0 pointer-events-none transition-opacity fixed inset-0 bg-black/95 z-200 md:z-10 p-12 pt-[4rem] lg:h-min lg:sticky lg:inset-auto lg:top-0 lg:bg-transparent lg:p-0 lg:pt-3 lg:w-[300px] lg:opacity-100 lg:pointer-events-auto"
            >
              <button
                data-sidebar-toggle
                class="lg:hidden absolute right-10 top-12 p-2 rounded-full border-1 border-neutral-300 color-neutral-300"
                type="button"
                title="Close Menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              {sideBar}
            </aside>
          )}
          <main
            class={`w-full ${
              sideBar ? "lg:border-l-2 pl-6 lg:border-white/10" : ""
            }`}
          >
            {children}
          </main>
        </div>
      </div>
      {sideBar && <script src="/sidebar.min.js"></script>}
    </>
  );
}
