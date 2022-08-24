// deno-lint-ignore-file ban-types
/** @jsx h */
/** @jsxFrag Fragment */
import { renderToString } from "https://esm.sh/preact-render-to-string@5.2.2";
import { h, Fragment, VNode, ComponentChildren } from "./preact.ts";

export interface RenderJSXOptions {
  html?: h.JSX.HTMLAttributes<HTMLHtmlElement>;
  head?: VNode<{}>;
  headAttrs?: h.JSX.HTMLAttributes<HTMLHeadElement>;
  bodyAttrs?: h.JSX.HTMLAttributes<HTMLBodyElement>;
}

export interface JSXOptions extends RenderJSXOptions {
  headers?: HeadersInit;
  status?: number;
  statusText?: string;
}

export interface HeadOptions {
  title?: string;
  meta?: Record<string, string | null | undefined>;
  links?: h.JSX.HTMLAttributes<HTMLLinkElement>[];
  styles?: (string | h.JSX.HTMLAttributes<HTMLStyleElement>)[];
  scripts?: (string | h.JSX.HTMLAttributes<HTMLScriptElement>)[];
  children?: ComponentChildren;
}

function Meta(meta: Record<string, string | null | undefined>) {
  const children: VNode[] = [];

  for (const [name, content] of Object.entries(meta)) {
    if (!name || !content) continue;

    if (name.startsWith("og:")) {
      children.push(<meta property={name} content={String(content)} />);
    } else {
      children.push(<meta name={name} content={String(content)} />);
    }
  }

  return <>{children}</>;
}

export function Head({
  title,
  meta,
  links,
  scripts,
  styles,
  children,
}: HeadOptions) {
  return (
    <>
      {title && <title>{title}</title>}
      {meta && Meta(meta)}
      {links && links.map((attrs) => <link {...attrs} />)}
      {styles &&
        styles.map((style) =>
          typeof style === "string" ? (
            <style dangerouslySetInnerHTML={{ __html: style }} />
          ) : (
            <style {...style} />
          )
        )}
      {scripts &&
        scripts.map((script) =>
          typeof script === "string" ? (
            <script dangerouslySetInnerHTML={{ __html: script }} />
          ) : (
            <script {...script}></script>
          )
        )}
      {children}
    </>
  );
}

export function renderJSX(body: VNode<{}>) {
  return renderToString(body);
}

function generateHTML(body: string, options: RenderJSXOptions = {}) {
  const htmlOpts: h.JSX.HTMLAttributes<HTMLHtmlElement> = {
    lang: "en",
    ...(options.html ?? {}),
  };

  const html = renderJSX(
    <html {...htmlOpts}>
      <head {...(options.headAttrs ?? {})}>
        <meta charSet="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {options?.head && options.head}
      </head>
      <body
        {...(options.bodyAttrs ?? {})}
        dangerouslySetInnerHTML={{ __html: body }}
      ></body>
    </html>
  );

  return "<!DOCTYPE html>" + html;
}

export interface CreateJSXOptions {
  transformBody?(body: VNode<{}>): Promise<VNode>;
  transformOptions?(body: string, options?: JSXOptions): Promise<JSXOptions>;
  transformHtml?(html: string): Promise<string>;
}

export function createJsx(createOptions: CreateJSXOptions = {}) {
  return async function $jsx(body: VNode<{}>, options: JSXOptions = {}) {
    body = (await createOptions.transformBody?.(body)) ?? body;

    const bodyStr = renderJSX(body);

    options =
      (await createOptions.transformOptions?.(bodyStr, options)) ?? options;

    let html = generateHTML(bodyStr, options);
    html = (await createOptions.transformHtml?.(html)) ?? html;

    const headers = new Headers(options.headers);
    headers.append("Content-Type", "text/html; charset=utf-8");

    return new Response(html, {
      headers,
      status: options.status,
      statusText: options.statusText,
    });
  };
}

export const jsx = createJsx();
