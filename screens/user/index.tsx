import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as React from "react";
import * as RN from "react-native";
import useSWR from "swr";
import { NavigableHeader } from "@/components/navigable-header";
import { StoryCard } from "@/components/story-card";
import { oneMemo, useDash } from "@/dash";
import type { StackParamList } from "@/screens/routers";
import type { HackerNewsUser } from "@/types/hn-api";

export function User(props: UserProps) {
  useDash();
  const { id } = props.route.params;
  /**
   * @see https://github.com/HackerNews/API
   */
  const user = useSWR<HackerNewsUser>(
    `https://hacker-news.firebaseio.com/v0/user/${id}.json`,
    (key) =>
      fetch(key, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }).then((res) => res.json())
  );

  const listHeaderComponent = React.useCallback(() => {
    return <NavigableHeader title={id} />;
  }, []);

  return (
    <RN.SafeAreaView style={container()}>
      <RN.FlatList
        ListHeaderComponent={listHeaderComponent}
        stickyHeaderIndices={[0]}
        refreshControl={
          <RN.RefreshControl
            refreshing={!user.data}
            onRefresh={() => user.mutate()}
          />
        }
        data={user.data?.submitted ?? fauxStories}
        keyExtractor={keyExtractor}
        initialNumToRender={4}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={100}
        windowSize={3}
        renderItem={renderFlatListItem}
        style={container()}
      />
    </RN.SafeAreaView>
  );
}

const fauxStories = Array.from<number>({ length: 6 }).fill(-1);

function keyExtractor(item: number, index: number) {
  return item === -1 ? index.toString() : item.toString();
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

export interface UserProps
  extends NativeStackScreenProps<StackParamList, "User"> {}
