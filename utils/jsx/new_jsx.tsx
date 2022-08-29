// deno-lint-ignore-file ban-types
/** @jsx h */
import { renderToString } from "https://esm.sh/preact-render-to-string@5.2.2?deps=preact@10.10.6";
import { h, VNode, ComponentChildren, createContext } from "./preact.ts";
import { useContext } from "https://esm.sh/v92/preact@10.10.6/hooks/src/index.d.ts";

type HeadData = {
  attrs: h.JSX.HTMLAttributes<HTMLHeadElement>;
  children: ComponentChildren[];
};

const HEAD_CTX = createContext<HeadData>({ attrs: {}, children: [] });
export function Head({
  children,
  ...props
}: h.JSX.HTMLAttributes<HTMLHeadElement>) {
  const head = useContext(HEAD_CTX);
  head.attrs = { ...head.attrs, ...props };
  head.children.push(children);
  return null;
}

type BodyData = {
  attrs: Omit<h.JSX.HTMLAttributes<HTMLBodyElement>, "children">;
};
const BODY_CTX = createContext<BodyData>({ attrs: {} });
export function Body({
  children,
  ...props
}: h.JSX.HTMLAttributes<HTMLBodyElement>) {
  const body = useContext(BODY_CTX);
  body.attrs = { ...body.attrs, ...props };
  return children;
}

type HtmlData = { attrs: h.JSX.HTMLAttributes<HTMLHtmlElement> };
const HTML_CTX = createContext<HtmlData>({ attrs: {} });
export function Html({
  children,
  ...props
}: h.JSX.HTMLAttributes<HTMLHtmlElement>) {
  const html = useContext(HTML_CTX);
  html.attrs = { ...html.attrs, ...props };
  return children;
}

const RESP_CTX = createContext<{
  headers: Headers;
  status?: number;
  statusText?: string;
}>({ headers: new Headers() });
export function Res(init: ResponseInit) {
  const res = useContext(RESP_CTX);
  res.status = init.status;
  res.statusText = init.statusText;
  const newHeaders = new Headers(init.headers);
  newHeaders.forEach((v, k) => res.headers.append(k, v));
  return null;
}

export interface RenderContext {
  response: {
    headers: Headers;
    status?: number;
    statusText?: string;
  };
  body: string;
  htmlData: HtmlData;
  headData: HeadData;
  bodyData: BodyData;
}

export interface CreateJSXOptions {
  transformBody?(body: VNode<{}>): VNode<{}>;
  transform?(ctx: RenderContext): void | Promise<void>;
}

export function createJSX(options: CreateJSXOptions) {
  return async function $jsx(body: VNode<{}>) {
    const ctx: RenderContext = {
      body: "",
      response: {
        headers: new Headers([["Content-Type", "text/html; charset=utf-8"]]),
      },
      bodyData: { attrs: {} },
      headData: {
        attrs: {},
        children: [
          <meta charSet="UTF-8" />,
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />,
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />,
        ],
      },
      htmlData: { attrs: {} },
    };

    ctx.body = renderToString(
      <RESP_CTX.Provider value={ctx.response}>
        <HTML_CTX.Provider value={ctx.htmlData}>
          <HEAD_CTX.Provider value={ctx.headData}>
            <BODY_CTX.Provider value={ctx.bodyData}>
              {options.transformBody?.(body) ?? body}
            </BODY_CTX.Provider>
          </HEAD_CTX.Provider>
        </HTML_CTX.Provider>
      </RESP_CTX.Provider>
    );

    await options.transform?.(ctx);

    const html = renderToString(
      <html {...ctx.htmlData.attrs}>
        <head {...ctx.headData.attrs}>{ctx.headData.children}</head>
        <body
          {...ctx.bodyData.attrs}
          dangerouslySetInnerHTML={{ __html: ctx.body }}
        />
      </html>
    );

    return new Response(html, ctx.response);
  };
}
