/** @jsx h */
/** @jsxFrag Fragment */
import { h, hydrate } from "../../utils/jsx/mod.ts";
import { SearchBar } from "./Search.tsx";

document.querySelectorAll(".search-bar").forEach((s) => {
  hydrate(<SearchBar />, s);
});
