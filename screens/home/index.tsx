import useSWRNative from "@nandorojo/swr-react-native";
import * as React from "react";
import { SafeAreaView, ScrollView, Text, View } from "@/components/primitives";

export function Home() {
  const stories = useSWRNative<number[]>(
    "https://hacker-news.firebaseio.com/v0/topstories.json",
    async function (key) {
      const response = await fetch(key, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      return await response.json();
    }
  );

  if (!stories.data) {
    return <Text>Loading...</Text>;
  }

  return (
    <SafeAreaView
      style={(t) => ({
        backgroundColor: t.color.headerBg,
      })}
    >
      <ScrollView
        style={(t) => ({
          height: "100%",
          paddingTop: 8,
          backgroundColor: t.color.bodyBg,
          borderBottomLeftRadius: t.radius.xl,
          borderBottomRightRadius: t.radius.xl,
        })}
      >
        {stories.data.slice(0, 20).map((id, index) => (
          <Story key={index} index={index} id={id} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function Story({ index, id }: { index: number; id: number }) {
  const story = useSWRNative(
    `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
    async function (key) {
      const response = await fetch(key, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      return await response.json();
    }
  );

  if (!story.data) {
    return <Text>Loading...</Text>;
  }

  const url = story.data.url ? new URL(story.data.url) : { host: "" };

  return (
    <View
      style={(t) => ({
        padding: t.space.lg,
        paddingTop: index === 0 ? t.space.lg : t.space.md,
        paddingBottom: index < 4 ? t.space.lg : t.space.md,
      })}
    >
      <Text
        style={(t) => ({
          color: t.color.primaryText,
          fontSize: t.type.size[index === 0 ? "3xl" : index < 4 ? "xl" : "sm"],
          fontWeight: index === 0 ? "900" : index < 4 ? "800" : "500",
          letterSpacing:
            index < 4 ? t.type.tracking.tighter : t.type.tracking.tight,
        })}
      >
        {story.data.title}
      </Text>
      <Text
        style={(t) => ({
          color: t.color.accentText,
          fontSize: t.type.size["2xs"],
          fontWeight: "300",
        })}
      >
        {url.host}
      </Text>
    </View>
  );
}
