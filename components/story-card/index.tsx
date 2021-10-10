import type { NavigationProp } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import * as RN from "react-native";
import useSWR from "swr";
import { Skeleton } from "@/components/skeleton";
import { lazyMemo, oneMemo, useDash } from "@/dash";
import { useMetadata } from "@/hooks/use-metadata";
import type { HomeStackParamList } from "@/screens/routers";
import type { HackerNewsStory } from "@/types/hn-api";
import { ago } from "@/utils/ago";

export const Story = React.memo(
  function Story({ index, id }: { index: number; id: number | null }) {
    useDash();
    const story = useSWR<HackerNewsStory>(
      id === -1
        ? null
        : `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
      (key) =>
        fetch(key, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }).then((res) => res.json())
    );
    const url = new URL(story.data?.url || "http://localhost");
    const navigation = useNavigation<NavigationProp<HomeStackParamList>>();
    const metadata = useMetadata(url);

    if (!story.data) {
      return (
        <RN.View style={storyContainer(index)}>
          <Skeleton style={storySkeleton(index)} />
        </RN.View>
      );
    }

    const data = story.data;

    return (
      <RN.View style={storyContainer(index)}>
        {metadata?.image ? (
          <RN.TouchableWithoutFeedback
            onPress={() =>
              navigation.navigate("BrowserModal", {
                title: data.title,
                url: url.toString(),
              })
            }
          >
            <RN.Image
              style={storyImage(index)}
              source={{ uri: metadata?.image }}
            />
          </RN.TouchableWithoutFeedback>
        ) : null}

        {url.host !== "localhost" && (
          <RN.TouchableWithoutFeedback
            onPress={() =>
              navigation.navigate("BrowserModal", {
                title: metadata?.applicationName || url.hostname,
                url: url.origin,
              })
            }
          >
            <RN.View style={hostContainerStyle}>
              <RN.Image style={favicon()} source={{ uri: metadata?.favicon }} />

              <RN.Text
                style={hostname()}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {metadata?.applicationName || url.host.replace(/^www\./, "")}
              </RN.Text>
            </RN.View>
          </RN.TouchableWithoutFeedback>
        )}

        <RN.TouchableWithoutFeedback
          onPress={() =>
            navigation.navigate("BrowserModal", {
              title: data.title,
              url: url.toString(),
            })
          }
        >
          <RN.Text
            style={storyTitle(index)}
            adjustsFontSizeToFit
            numberOfLines={
              index === 0 ? 3 : index < 5 && metadata?.image ? 4 : 6
            }
          >
            {data.title}
          </RN.Text>
        </RN.TouchableWithoutFeedback>

        <RN.View>
          <RN.View style={byLine}>
            <RN.TouchableWithoutFeedback
              onPress={() => navigation.navigate("User", { id: data.by })}
            >
              <RN.Text style={byStyle()}>@{data.by}</RN.Text>
            </RN.TouchableWithoutFeedback>
            <RN.Text style={agoStyle()}>
              {ago.format(new Date(data.time * 1000), "mini")}
            </RN.Text>
          </RN.View>

          <RN.Text style={footerText()}>
            ⇧{data.score} &bull;{" "}
            <RN.Text style={commentsStyle}>{data.descendants} comments</RN.Text>
          </RN.Text>
        </RN.View>
      </RN.View>
    );
  },
  (prev, next) => prev.id === next.id && prev.index === next.index
);

const storyContainer = lazyMemo<number, RN.ViewStyle>((index) => (t) => ({
  width: index === 0 || index > 4 ? "100%" : "50%",
  padding: t.space.lg,
  paddingTop: index === 0 ? t.space.xl : index < 5 ? t.space.md : t.space.lg,
  paddingBottom: index === 0 ? t.space.xl : index < 5 ? t.space.lg : t.space.lg,
}));

const storySkeleton = lazyMemo<number, RN.ViewStyle>((index) => (t) => ({
  width: "100%",
  height: index === 0 || index > 4 ? 172 : 96,
  marginBottom: t.space.md,
  borderRadius: t.radius.secondary,
}));

const storyImage = lazyMemo<number, RN.ImageStyle>((index: number) => (t) => ({
  width: "100%",
  height: index === 0 || index > 4 ? 172 : 96,
  marginBottom: t.space.md,
  borderRadius: t.radius.secondary,
}));

const hostContainerStyle: RN.ViewStyle = {
  width: "100%",
  flexDirection: "row",
  alignItems: "center",
};

const favicon = oneMemo<RN.ImageStyle>((t) => ({
  width: 20,
  height: 20,
  borderRadius: t.radius.md,
  marginRight: t.space.sm,
}));

const hostname = oneMemo<RN.TextStyle>((t) => ({
  flex: 1,
  width: "100%",
  color: t.color.textAccent,
  fontSize: t.type.size["2xs"],
  fontWeight: "300",
}));

const storyTitle = lazyMemo<number, RN.TextStyle>((index: number) => (t) => ({
  color: t.color.textPrimary,
  fontSize: t.type.size[index === 0 ? "6xl" : index < 5 ? "lg" : "sm"],
  fontWeight: index === 0 ? "900" : index < 5 ? "800" : "700",
  letterSpacing: index < 4 ? t.type.tracking.tighter : t.type.tracking.tight,
  paddingTop: t.space.sm,
  paddingBottom: t.space.sm,
}));

const byLine: RN.ViewStyle = {
  width: "100%",
  flexDirection: "row",
  justifyContent: "space-between",
};

const byStyle = oneMemo<RN.TextStyle>((t) => ({
  color: t.color.textAccent,
  fontSize: t.type.size["2xs"],
  fontWeight: "300",
  padding: t.space.sm,
  paddingTop: 0,
  paddingLeft: 0,
}));

const agoStyle = oneMemo<RN.TextStyle>((t) => ({
  color: t.color.textAccent,
  fontSize: t.type.size["2xs"],
  fontWeight: "300",
}));

const footerText = oneMemo<RN.TextStyle>((t) => ({
  fontWeight: "600",
  color: t.color.textAccent,
  fontSize: t.type.size["2xs"],
}));

const commentsStyle: RN.TextStyle = { fontWeight: "300" };
