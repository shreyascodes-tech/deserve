/** @jsx h */
/** @jsxFrag Fragment */
import { h, Fragment } from "../../utils/jsx/mod.ts";
import { joinURL, withTrailingSlash } from "../../lib/internal.ts";
import docs from "../docs/docs.json" assert { type: "json" };
import { SearchBar } from "./Search.tsx";

interface Entry {
  title: string;
  pages?: [string, string][];
}

function ListItem({
  entry: { title, pages },
  path,
  currentPath,
}: {
  path: string;
  currentPath: string;
  entry: Entry;
}) {
  if (!pages) {
    const active = withTrailingSlash(path) === withTrailingSlash(currentPath);

    return (
      <li>
        <a
          class={`block px-4 py-2 rounded transition-colors ${
            active
              ? "bg-white/20"
              : "hover:bg-white/30 focus:bg-white/30 active:bg-white/30"
          }`}
          href={path}
        >
          {title}
        </a>
      </li>
    );
  }
  return (
    <li>
      <ul class="px-4">
        <li className="block py-2 font-black">{title}</li>
        {pages.map(([pagePath, title]) => (
          <ListItem
            currentPath={currentPath}
            path={joinURL(path, pagePath)}
            entry={{ title }}
          />
        ))}
      </ul>
    </li>
  );
}

export default function SideBar({ path: currentPage }: { path: string }) {
  const entries = Object.entries(docs["Documentation"]) as [string, Entry][];

  return (
    <>
      <strong class="text-lg">Documentation</strong>
      <div class="lg:hidden mt-4 search-bar bg-white/30">
        <SearchBar />
      </div>
      <ul class="mt-3">
        {entries.map(([path, entry]) => (
          <ListItem
            currentPath={currentPage}
            path={joinURL("/docs", path)}
            entry={entry}
          />
        ))}
      </ul>
    </>
  );
}
