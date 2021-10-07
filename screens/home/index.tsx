import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";
import { parse as parseHtml } from "node-html-parser";
import * as React from "react";
import useSWR from "swr";
import memoize from "trie-memoize";
import {
  Image,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "@/components/primitives";
import { Skeleton } from "@/components/skeleton";

export function Home() {
  const stories = useSWR<number[]>(
    "https://hacker-news.firebaseio.com/v0/topstories.json",
    (key) =>
      fetch(key, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }).then((res) => res.json())
  );

  if (!stories.data) {
    return <Text>Loading...</Text>;
  }

  const date = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <View
      style={(t) => ({
        backgroundColor: t.color.headerBg,
      })}
    >
      <ScrollView
        style={(t) => ({
          height: "100%",
          backgroundColor: t.color.bodyBg,
          borderBottomLeftRadius: t.radius.xl,
          borderBottomRightRadius: t.radius.xl,
        })}
        refreshControl={
          <RefreshControl
            refreshing={!stories.data}
            onRefresh={() => stories.mutate([])}
          />
        }
      >
        <Text
          style={(t) => ({
            backgroundColor: t.color.headerBg,
            padding: t.space.lg,
            paddingTop: 0,
            paddingBottom: 0,
            fontSize: t.type.size["lg"],
            lineHeight: t.type.size["lg"],
            fontWeight: "900",
            color: t.color.textAccent,
          })}
        >
          {date}
        </Text>
        <View
          style={() => ({
            flexDirection: "row",
            flexWrap: "wrap",
            width: "100%",
            flexGrow: 0,
            flexShrink: 1,
          })}
        >
          {(!stories.data
            ? (Array.from({ length: 12 }).fill(null) as null[])
            : stories.data
          )
            .slice(0, 12)
            .map((id, index) => (
              <Story key={index} index={index} id={id} />
            ))}
        </View>
      </ScrollView>
    </View>
  );
}

function Story({ index, id }: { index: number; id: number | null }) {
  const story = useSWR<{
    by: string;
    descendants: number;
    id: number;
    kids: number[];
    score: number;
    time: number;
    title: string;
    type: "story" | "job" | "comment" | "poll" | "pollopt";
    url: "http://www.getdropbox.com/u/2/screencast.html";
  }>(
    id === null ? id : `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
    (key) =>
      fetch(key, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }).then((res) => res.json())
  );
  const [showSkeletonImage] = React.useState(Math.random() > 0.67);
  const url = new URL(story.data?.url || "http://localhost");
  const metadata = useMetadata(url);
  const [faviconStatus, setFaviconStatus] = React.useState<
    "loading" | "error" | "success"
  >("loading");

  if (metadata?.favicon && faviconStatus !== "success") {
    setFaviconStatus("success");
  }

  if (!story.data) {
    return (
      <View
        style={(t) => ({
          width: index === 0 || index > 4 ? "100%" : "50%",
          padding: t.space.lg,
          paddingTop:
            index === 0 ? t.space.xl : index < 5 ? t.space.md : t.space.lg,
          paddingBottom:
            index === 0 ? t.space.xl : index < 5 ? t.space.lg : t.space.lg,
        })}
      >
        {showSkeletonImage && (
          <Skeleton
            style={(t) => ({
              width: "100%",
              height: index === 0 || index > 4 ? 172 : 96,
              marginBottom: t.space.md,
              borderRadius: t.radius.secondary,
            })}
          />
        )}
        <View
          style={(t) => ({
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            marginBottom: t.space.sm,
          })}
        >
          <Skeleton
            style={(t) => ({
              width: 20,
              height: 20,
              borderRadius: t.radius.md,
              marginRight: t.space.sm,
            })}
          />

          <Skeleton
            style={(t) => ({
              flex: 1,
              width: 160,
              height: t.type.size["2xs"] * 1.25,
            })}
          />
        </View>

        <Skeleton
          style={(t) => ({
            width: "100%",
            height:
              t.type.size[index === 0 ? "6xl" : index < 5 ? "lg" : "sm"] * 1.25,
            marginBottom: t.space.sm,
          })}
        />

        <View>
          <View
            style={(t) => ({
              width: "100%",
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: t.space.xs,
            })}
          >
            <Skeleton
              style={(t) => ({
                height: t.type.size["2xs"] * 1.25,
                width: 120,
              })}
            />

            <Skeleton
              style={(t) => ({
                height: t.type.size["2xs"] * 1.25,
                width: 30,
              })}
            />
          </View>

          <View
            style={(t) => ({
              flexDirection: "row",
              width: "100%",
              height: t.type.size["2xs"] * 1.25,
            })}
          >
            <Skeleton
              style={(t) => ({
                height: "100%",
                width: 54,
                marginRight: t.space.lg,
              })}
            />
            <Skeleton
              style={(t) => ({
                height: "100%",
                width: 72,
              })}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View
      style={(t) => ({
        width: index === 0 || index > 4 ? "100%" : "50%",
        padding: t.space.lg,
        paddingTop:
          index === 0 ? t.space.xl : index < 5 ? t.space.md : t.space.lg,
        paddingBottom:
          index === 0 ? t.space.xl : index < 5 ? t.space.lg : t.space.lg,
      })}
    >
      {metadata?.image ? (
        <Image
          source={{ uri: metadata?.image }}
          style={(t) => ({
            width: "100%",
            height: index === 0 || index > 4 ? 172 : 96,
            marginBottom: t.space.md,
            borderRadius: t.radius.secondary,
          })}
        />
      ) : null}

      <View
        style={(t) => ({
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
          marginBottom: t.space.sm,
        })}
      >
        {faviconStatus === "success" ? (
          <Image
            source={{ uri: metadata?.favicon }}
            style={(t) => ({
              width: 20,
              height: 20,
              borderRadius: t.radius.md,
              marginRight: t.space.sm,
            })}
            onError={() => setFaviconStatus("error")}
          />
        ) : null}

        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={(t) => ({
            flex: 1,
            width: "100%",
            color: t.color.textAccent,
            fontSize: t.type.size["2xs"],
            fontWeight: "300",
          })}
        >
          {metadata?.applicationName || url.host.replace(/^www\./, "")}
        </Text>
      </View>

      <Text
        adjustsFontSizeToFit
        numberOfLines={index === 0 ? 3 : index < 5 && metadata?.image ? 4 : 6}
        style={(t) => ({
          color: t.color.textPrimary,
          fontSize: t.type.size[index === 0 ? "6xl" : index < 5 ? "lg" : "sm"],
          fontWeight: index === 0 ? "900" : index < 5 ? "800" : "700",
          letterSpacing:
            index < 4 ? t.type.tracking.tighter : t.type.tracking.tight,
          marginBottom: t.space.sm,
        })}
      >
        {story.data.title}
      </Text>

      <View>
        <View
          style={(t) => ({
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: t.space.xs,
          })}
        >
          <Text
            style={(t) => ({
              color: t.color.textAccent,
              fontSize: t.type.size["2xs"],
              fontWeight: "300",
            })}
          >
            @{story.data.by}
          </Text>

          <Text
            style={(t) => ({
              color: t.color.textAccent,
              fontSize: t.type.size["2xs"],
              fontWeight: "300",
            })}
          >
            {timeAgo.format(new Date(story.data.time * 1000), "mini")}
          </Text>
        </View>

        <Text
          style={(t) => ({
            fontWeight: "600",
            color: t.color.textAccent,
            fontSize: t.type.size["2xs"],
          })}
        >
          ⇧{story.data.score} &bull;{" "}
          <Text style={(t) => ({ fontWeight: "300" })}>
            {story.data.descendants} comments
          </Text>
        </Text>
      </View>
    </View>
  );
}

function useMetadata(url: URL) {
  const html = useSWR(
    url.host && url.host !== "localhost" ? url.toString() : null,
    (key) => fetch(key).then((res) => res.text())
  );
  const parsedHtml = html.data ? parse(html.data) : undefined;
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
}

const parse = memoize([Map], parseHtml);
TimeAgo.addLocale(en);
const timeAgo = new TimeAgo("en-US");
