/** @jsx h */
/** @jsxFrag Fragment */
import { h, Fragment } from "https://deno.land/x/htm@0.0.10/mod.tsx";
import { joinURL } from "../../lib/internal.ts";
import docs from "../docs/docs.json" assert { type: "json" };

interface Entry {
  title: string;
  pages?: [string, string][];
}

function ListItem({
  entry: { title, pages },
  path,
}: {
  path: string;
  entry: Entry;
}) {
  if (!pages)
    return (
      <li>
        <a
          class="block px-4 py-2 rounded transition-colors hover:bg-white/25 focus:bg-white/25 md:hover:bg-black/25 md:focus:bg-black/25 active:bg-white/25 md:active:bg-vlack/25"
          href={path}
        >
          {title}
        </a>
      </li>
    );

  return (
    <li>
      <ul class="px-4">
        <li className="block py-2">{title}</li>
        {pages.map(([pagePath, title]) => (
          <ListItem path={joinURL(path, pagePath)} entry={{ title }} />
        ))}
      </ul>
    </li>
  );
}

export default function SideBar() {
  const entries = Object.entries(docs["Documentation"]) as [string, Entry][];

  return (
    <>
      <strong class="text-lg">Documentation</strong>
      <ul class="mt-3">
        {entries.map(([path, entry]) => (
          <ListItem path={joinURL("/docs", path)} entry={entry} />
        ))}
      </ul>
    </>
  );
}
