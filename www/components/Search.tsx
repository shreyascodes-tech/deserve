/** @jsx h */
/** @jsxFrag Fragment */
import {
  h,
  Fragment,
  useState,
  useCallback,
  Body,
  useEffect,
} from "../../utils/jsx/mod.ts";

function useDebounce<T>(value: T, delay: number): T {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent debounced value from updating if value is changed ...
      // .. within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Only re-call effect if value or delay changes
  );
  return debouncedValue;
}

function useAsync<T, E = string>(
  asyncFunction: () => Promise<T>,
  immediate = true,
  initial?: T
) {
  const [status, setStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [value, setValue] = useState<T | null>();
  const [error, setError] = useState<E | null>(null);
  // The execute function wraps asyncFunction and
  // handles setting state for pending, value, and error.
  // useCallback ensures the below useEffect is not called
  // on every render, but only if asyncFunction changes.
  const execute = useCallback(() => {
    setStatus("pending");
    setValue(null);
    setError(null);
    return asyncFunction()
      .then((response: any) => {
        setValue(response);
        setStatus("success");
      })
      .catch((error: any) => {
        setError(error);
        setStatus("error");
      });
  }, [asyncFunction]);
  // Call execute if we want to fire it right away.
  // Otherwise execute can be called later, such as
  // in an onClick handler.
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);
  return { execute, status, value, error };
}

async function searchQuery(query: string) {
  const res = await fetch("/docs/search", {
    method: "POST",
    body: JSON.stringify({
      query,
    }),
  });

  const data = (await res.json()) as {
    path: string;
    title: string;
    score: number;
  }[];

  return data.sort((a, b) => a.score - b.score);
}

export function SearchBar() {
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearchInput = useDebounce(searchInput, 150);
  const searchFn = useCallback(
    () => searchQuery(debouncedSearchInput),
    [debouncedSearchInput]
  );
  const { execute, status, error, value } = useAsync(searchFn, false);

  useEffect(() => {
    if (!searchInput) return;
    execute();
  }, [debouncedSearchInput]);

  const onChangeHandler: h.JSX.GenericEventHandler<HTMLInputElement> =
    useCallback((e) => {
      setSearchInput((e.target as HTMLInputElement).value);
    }, []);

  return (
    <>
      <Body>
        <script defer src="/search.client.js"></script>
      </Body>
      <div class="relative">
        <input
          class="w-full h-full px-4 py-2 rounded outline-offset-4 bg-transparent"
          type="search"
          value={searchInput}
          onInput={onChangeHandler}
          placeholder="Search Docs"
        />
        <div
          class={
            "absolute top-[120%] p-4 min-w-full max-w-[400px] w-screen bg-black/90 rounded " +
            (!value || debouncedSearchInput === "" ? "hidden" : "block")
          }
        >
          {globalThis.Deno ? (
            // @ts-ignore ..
            <template>
              <a
                href="#"
                class="block w-full h-full px-4 py-2 rounded bg-transparent hover:bg-white/40 focus:bg-white/40 transition-colors"
              >
                test
              </a>
              {/* @ts-ignore */}
            </template>
          ) : null}
          {!value || !debouncedSearchInput ? null : (
            <ul>
              {status === "pending" ? (
                <li class="block w-full h-full px-4 py-2">Loading...</li>
              ) : status === "error" ? (
                <li class="block w-full h-full px-4 py-2 text-red-500">
                  Error! {error}
                </li>
              ) : (
                value!.map(({ path, title }) => (
                  <li>
                    <a
                      onClick={() => setSearchInput("")}
                      href={"/docs/" + path}
                      class="block w-full h-full px-4 py-2 rounded bg-transparent hover:bg-white/40 focus:bg-white/40 transition-colors"
                    >
                      {title}
                    </a>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
