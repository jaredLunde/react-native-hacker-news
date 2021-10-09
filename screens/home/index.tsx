import memoize from "@essentials/memoize-one";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as React from "react";
import * as RN from "react-native";
import useSWR from "swr";
import { Story } from "@/components/story-card";
import { styled, styledMemo, styles, tokensAreEqual, useDash } from "@/dash";
import type { StackParamList } from "@/screens/routers";

export function Home(props: HomeProps) {
  /**
   * @see https://github.com/HackerNews/API
   */
  const stories = useSWR<number[]>(
    "https://hacker-news.firebaseio.com/v0/topstories.json",
    (key) =>
      fetch(key, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }).then((res) => res.json())
  );
  const [storyCount, setStoryCount] = React.useState(12);
  useDash();

  React.useEffect(() => {
    RN.LogBox.ignoreLogs(["VirtualizedLists should never be nested"]);
  }, []);

  const flatListData = React.useMemo(
    () => stories.data?.slice(5, storyCount),
    [stories.data, storyCount]
  );

  const loadMore = React.useCallback(() => {
    setStoryCount((prev) => prev + 12);
  }, []);

  const listHeaderComponent = React.useCallback(() => {
    return (
      <React.Fragment>
        <ListHeaderComponent />
        <List>{(stories.data ?? fauxStories).slice(0, 5).map(renderItem)}</List>
      </React.Fragment>
    );
  }, [stories.data]);

  return (
    <RN.FlatList
      ListHeaderComponent={listHeaderComponent}
      refreshControl={
        <RN.RefreshControl
          refreshing={!stories.data}
          onRefresh={() => stories.mutate([])}
        />
      }
      data={flatListData ?? []}
      keyExtractor={keyExtractor}
      initialNumToRender={4}
      maxToRenderPerBatch={5}
      updateCellsBatchingPeriod={100}
      windowSize={3}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      renderItem={renderFlatListItem}
      style={container()}
    />
  );
}

const fauxStories = Array.from({ length: 6 }).fill(-1) as number[];

function keyExtractor(item: number) {
  return item.toString();
}

function renderItem(item: number, index: number) {
  return <Story key={item === -1 ? index : item} index={index} id={item} />;
}

function renderFlatListItem({ item, index }: { item: number; index: number }) {
  return <Story key={item} index={index + 5} id={item} />;
}

const container = styles.one(
  memoize(
    (t) => ({
      backgroundColor: t.color.bodyBg,
      height: "100%",
    }),
    tokensAreEqual
  )
);

const List = styled(RN.View, {
  flexDirection: "row",
  flexWrap: "wrap",
});

function ListHeaderComponent() {
  const date = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return <CurrentDate>{date}</CurrentDate>;
}

const CurrentDate = styledMemo(RN.Text, (t) => ({
  backgroundColor: t.color.headerBg,
  padding: t.space.lg,
  paddingTop: 0,
  paddingBottom: 0,
  fontSize: t.type.size["lg"],
  lineHeight: t.type.size["lg"],
  fontWeight: "900",
  color: t.color.textAccent,
}));
export interface HomeProps
  extends NativeStackScreenProps<StackParamList, "Home"> {}
