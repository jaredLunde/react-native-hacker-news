import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Linking from "expo-linking";
import * as htmlEntities from "html-entities";
import React from "react";
import * as RN from "react-native";
import type {
  MixedStyleRecord,
  RenderersProps,
} from "react-native-render-html";
import RenderHTML from "react-native-render-html";
import useSWR from "swr";
import { Icon } from "@/components/icon";
import { Skeleton } from "@/components/skeleton";
import { oneMemo, useDash } from "@/dash";
import type { StackParamList } from "@/screens/routers";
import type {
  HackerNewsAsk,
  HackerNewsJob,
  HackerNewsPoll,
  HackerNewsStory,
} from "@/types/hn-api";

export function ThreadModal({ navigation, route }: ThreadModalProps) {
  useDash();
  const { id } = route.params;
  const dimensions = RN.useWindowDimensions();
  const story = useSWR<
    HackerNewsStory | HackerNewsJob | HackerNewsPoll | HackerNewsAsk
  >(
    id === -1 ? null : `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
    (key) =>
      fetch(key, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }).then((res) => res.json())
  );

  const htmlRenderersProps = React.useMemo<Partial<RenderersProps>>(
    () => ({
      a: {
        onPress(_, url) {
          navigation.navigate("BrowserModal", { title: url, url });
        },
      },
    }),
    [navigation.navigate]
  );

  const htmlTagStyles = React.useMemo<MixedStyleRecord>(
    () => ({ a: link() }),
    []
  );

  const htmlSource = React.useMemo(
    () =>
      story.data &&
      "text" in story.data && {
        html: linkify(story.data.text),
      },
    [story.data]
  );

  const listHeaderComponent = React.useCallback(
    () =>
      !story.data ? null : (
        <RN.View style={storyContainer()}>
          <RN.Text numberOfLines={4} adjustsFontSizeToFit style={title()}>
            {story.data.title}
          </RN.Text>

          {htmlSource && (
            <RenderHTML
              contentWidth={dimensions.width}
              source={htmlSource}
              baseStyle={content()}
              tagsStyles={htmlTagStyles}
              defaultTextProps={htmlDefaultTextProps}
              renderersProps={htmlRenderersProps}
              enableExperimentalBRCollapsing
              enableExperimentalGhostLinesPrevention
              enableExperimentalMarginCollapsing
            />
          )}
        </RN.View>
      ),
    [
      story.data?.title,
      htmlSource,
      dimensions.width,
      htmlTagStyles,
      htmlRenderersProps,
    ]
  );

  if (!story.data) {
    return (
      <RN.View>
        <Skeleton />
      </RN.View>
    );
  }

  return (
    <RN.View style={container()}>
      <RN.View style={modalHeader()}>
        <RN.TouchableOpacity
          style={closeButton()}
          onPress={() => navigation.goBack()}
        >
          <Icon name="x" size={18} color="textAccent" />
        </RN.TouchableOpacity>
      </RN.View>

      <RN.FlatList
        ListHeaderComponent={listHeaderComponent}
        data={
          !story.data
            ? fauxFlatComments
            : "kids" in story.data
            ? story.data.kids
            : []
        }
        keyExtractor={keyExtractor}
        initialNumToRender={4}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={100}
        windowSize={3}
        renderItem={renderItem}
        style={container()}
      />
    </RN.View>
  );
}

const fauxFlatComments = Array.from<number>({ length: 3 }).fill(-1);

function renderItem({ item, index }: { item: number; index: number }) {
  return <RN.Text style={title()}>{item}</RN.Text>;
}

function keyExtractor(item: number, index: number) {
  return item === -1 ? index.toString() : item.toString();
}

const container = oneMemo<RN.ViewStyle>((t) => ({
  flex: 1,
  backgroundColor: t.color.bodyBg,
}));

const modalHeader = oneMemo<RN.ViewStyle>((t) => ({
  flexDirection: "row",
  alignItems: "center",
  width: "100%",
  padding: t.space.md,
  borderBottomColor: t.color.accent,
  borderBottomWidth: t.borderWidth.hairline,
}));

const closeButton = oneMemo<RN.ViewStyle>((t) => ({
  alignItems: "center",
  justifyContent: "center",
  width: 18 + t.space.sm * 2,
  height: 18 + t.space.sm * 2,
  borderRadius: t.radius.full,
  marginRight: t.space.md,
  backgroundColor: t.color.accentLight,
}));

const storyContainer = oneMemo<RN.ViewStyle>((t) => ({
  borderBottomWidth: t.borderWidth.hairline,
  borderBottomColor: t.color.accent,
}));

const title = oneMemo<RN.TextStyle>((t) => ({
  color: t.color.textPrimary,
  fontSize: t.type.size.xl,
  fontWeight: "900",
  padding: t.space.lg,
}));

const content = oneMemo((t) => ({
  color: t.color.textPrimary,
  fontSize: t.type.size.sm,
  fontWeight: "400",
  padding: t.space.lg,
  paddingTop: 0,
}));

const link = oneMemo((t) => ({
  color: t.color.textPrimary,
  fontSize: t.type.size.sm,
  fontWeight: "600",
  textDecorationLine: "underline",
  textDecorationColor: t.color.primary,
}));

const htmlDefaultTextProps: RN.TextProps = {
  selectable: true,
};

const urlRe =
  /(?:^|\s)((https?:\/\/|\/\/)[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi;

function linkify(text: string) {
  text = htmlEntities.decode(text);
  const matches = text.matchAll(urlRe);

  for (const match of matches) {
    const href = match[1];
    text = text.replace(
      href,
      `<a href="${href}" rel="nofollow noreferrer">${href}</a>`
    );
  }

  return text;
}

export interface ThreadModalProps
  extends NativeStackScreenProps<StackParamList, "ThreadModal"> {}
