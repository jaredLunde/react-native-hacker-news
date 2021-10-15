import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as React from "react";
import * as RN from "react-native";
import useSWR from "swr";
import { LogoHeader } from "@/components/logo-header";
import { StoryCard } from "@/components/story-card";
import { oneMemo, useDash } from "@/dash";
import type { StackParamList } from "@/screens/routers";

export function Stories(props: StoriesProps) {
  useDash();
  const { filter } = props.route.params;
  const [didMount, setDidMount] = React.useState(false);

  /**
   * @see https://github.com/HackerNews/API
   */
  const stories = useSWR<number[]>(
    `https://hacker-news.firebaseio.com/v0/${filter}stories.json`,
    (key) =>
      fetch(key, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }).then((res) => res.json())
  );

  React.useEffect(() => {
    if (stories.data) {
      setDidMount(true);
    }
  }, [stories.data]);

  React.useEffect(() => {
    RN.LogBox.ignoreLogs(["VirtualizedLists should never be nested"]);
  }, []);

  const flatListData = React.useMemo(
    () => stories.data?.slice(5),
    [stories.data]
  );

  const listHeaderComponent = React.useCallback(() => {
    return (
      <React.Fragment>
        <LogoHeader
          title={
            filter === "show"
              ? "Show HN"
              : filter === "ask"
              ? "Ask HN"
              : filter === "job"
              ? "Jobs"
              : "HN"
          }
        />
        <RN.View style={listStyle}>
          {(stories.data ?? fauxStories).slice(0, 5).map(renderItem)}
        </RN.View>
      </React.Fragment>
    );
  }, [stories.data, filter]);

  return (
    <RN.FlatList
      ListHeaderComponent={listHeaderComponent}
      refreshControl={
        <RN.RefreshControl
          refreshing={!stories.data && didMount}
          onRefresh={() => stories.mutate()}
        />
      }
      data={flatListData ?? fauxFlatStories}
      keyExtractor={keyExtractor}
      initialNumToRender={4}
      maxToRenderPerBatch={5}
      updateCellsBatchingPeriod={100}
      windowSize={3}
      renderItem={renderFlatListItem}
      style={container()}
    />
  );
}

const fauxStories = Array.from<number>({ length: 12 }).fill(-1);
const fauxFlatStories = Array.from<number>({ length: 3 }).fill(-1);

function keyExtractor(item: number, index: number) {
  return item === -1 ? index.toString() : item.toString();
}

function renderItem(item: number, index: number) {
  return <StoryCard key={item === -1 ? index : item} index={index} id={item} />;
}

function renderFlatListItem({ item, index }: { item: number; index: number }) {
  return (
    <StoryCard key={item === -1 ? index : item} index={index + 5} id={item} />
  );
}

const container = oneMemo<RN.ViewStyle>((t) => ({
  backgroundColor: t.color.bodyBg,
  height: "100%",
  width: "100%",
}));

const listStyle: RN.ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
};

export interface StoriesProps
  extends NativeStackScreenProps<StackParamList, "Stories"> {}
