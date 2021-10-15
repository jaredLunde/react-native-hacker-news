import { parse as parseHtml } from "node-html-parser";
import * as React from "react";
import useSWR from "swr";
import memoize from "trie-memoize";

export function useMetadata(url: URL | undefined) {
  const [timedOut, setTimedOut] = React.useState(false);
  const didUnsubscribe = React.useRef(false);
  const html = useSWR(
    url?.host ? url.toString() : null,
    (key) =>
      fetch(key).then((res) => {
        if (res.headers.get("content-type")?.includes("text/html")) {
          return res.text();
        }

        return null;
      }),
    {
      shouldRetryOnError: false,
      onLoadingSlow: () => !didUnsubscribe.current && setTimedOut(true),
    }
  );

  React.useEffect(() => {
    setTimeout(() => {
      if (html.data || html.error) {
        return;
      }

      !didUnsubscribe.current && setTimedOut(true);
    }, 4000);

    return () => {
      didUnsubscribe.current = true;
    };
  }, []);

  const parsedHtml =
    typeof html.data === "string" ? parse(html.data) : html.data;

  return React.useMemo(() => {
    if (
      !url?.host ||
      html.error ||
      parsedHtml === null ||
      (!parsedHtml && timedOut)
    ) {
      return {
        favicon: undefined,
        image: undefined,
        applicationName: undefined,
      };
    }

    if (parsedHtml) {
      return {
        favicon:
          [
            ...parsedHtml.querySelectorAll("link[rel=apple-touch-icon]"),
            ...parsedHtml.querySelectorAll("link[rel=icon]"),
            ...parsedHtml.querySelectorAll("link[rel='shortcut icon']"),
          ]
            .filter((link) => {
              if (!link) return false;
              const href = link.getAttribute("href");
              if (!href) return false;
              return !href.endsWith(".svg");
            })
            .map((link) =>
              new URL(
                link.getAttribute("href")!,
                url.protocol + "//" + url.host
              ).toString()
            )[0] || new URL("/favicon.ico", url.toString()).toString(),
        image: [
          ...parsedHtml.querySelectorAll("meta[name=og:image]"),
          ...parsedHtml.querySelectorAll("meta[name=og:image:url]"),
          ...parsedHtml.querySelectorAll("meta[name=og:image:secure_url]"),
          ...parsedHtml.querySelectorAll("meta[name=twitter:image]"),
          ...parsedHtml.querySelectorAll("main article figure img"),
          ...parsedHtml.querySelectorAll("article figure img"),
          ...parsedHtml.querySelectorAll("main figure img"),
          ...parsedHtml.querySelectorAll("figure img"),
        ]
          .filter((meta) => {
            if (!meta) return false;
            const content =
              meta.getAttribute("content") || meta.getAttribute("src");
            if (!content) return false;
            return !content.endsWith(".svg");
          })
          .map((meta) =>
            new URL(
              (meta.getAttribute("content") || meta.getAttribute("src"))!,
              url.toString()
            ).toString()
          )[0],
        applicationName: parsedHtml
          .querySelectorAll("meta[name=application-name]")
          .filter((meta) => {
            if (!meta) return false;
            const content = meta.getAttribute("content");
            if (!content) return false;
            return !content.endsWith(".svg");
          })
          .map((meta) => meta.getAttribute("content"))[0],
      };
    }
  }, [html.error, parsedHtml, timedOut, url + ""]);
}

const parse = memoize([Map], parseHtml);
