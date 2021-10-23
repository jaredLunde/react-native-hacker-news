import { useNavigation } from "@react-navigation/native";
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
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
import { lazyMemo, oneMemo, useDash } from "@/dash";
import { useMetadata } from "@/hooks/use-metadata";
import { useParents } from "@/hooks/use-parents";
import type { StackParamList } from "@/screens/routers";
import type {
  HackerNewsAsk,
  HackerNewsComment,
  HackerNewsJob,
  HackerNewsPoll,
  HackerNewsStory,
} from "@/types/hn-api";
import { ago } from "@/utils/ago";
import { pluralize } from "@/utils/pluralize";

export function Thread({ route }: ThreadProps) {
  const { id } = route.params;
  const { data, mutate } = useSWR<
    | HackerNewsStory
    | HackerNewsJob
    | HackerNewsPoll
    | HackerNewsAsk
    | HackerNewsComment
  >(
    id === -1 ? null : `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
    (key) =>
      fetch(key, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }).then((res) => res.json())
  );

  if (!data) {
    return null;
  }

  return data.type === "comment" ? (
    <CommentThread data={data} onRefresh={() => mutate()} />
  ) : (
    <StoryThread data={data} onRefresh={() => mutate()} />
  );
}

function StoryThread({
  data,
  onRefresh,
}: {
  data: HackerNewsStory | HackerNewsJob | HackerNewsPoll | HackerNewsAsk;
  onRefresh(): unknown;
}) {
  const { theme } = useDash();
  const dimensions = RN.useWindowDimensions();
  const [didMount, setDidMount] = React.useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<StackParamList>>();
  const url = React.useMemo(
    () => ("url" in data && data.url ? new URL(data.url) : undefined),
    [data]
  );
  const metadata = useMetadata(url);
  React.useEffect(() => {
    if (data) {
      setDidMount(true);
    }
  }, [data]);
  const htmlRenderersProps = React.useMemo<Partial<RenderersProps>>(
    () => ({
      a: {
        onPress(_, url) {
          navigation.navigate("BrowserModal", { title: url, url });
        },
      },
    }),
    [navigation]
  );

  const htmlTagStyles = React.useMemo<MixedStyleRecord>(
    () => ({ a: link() }),
    [theme]
  );

  const htmlSource = React.useMemo(
    () =>
      "text" in data && {
        html: linkify(data.text),
      },
    [data]
  );

  const listHeaderComponent = React.useCallback(
    () =>
      !data ? null : (
        <RN.View>
          {metadata?.image ? (
            <React.Fragment>
              <RN.View style={floatingHeader()}>
                <RN.SafeAreaView>
                  <RN.TouchableOpacity
                    style={backButton()}
                    onPress={() => navigation.goBack()}
                  >
                    <Icon name="chevron-left" size={18} color="textAccent" />
                  </RN.TouchableOpacity>
                </RN.SafeAreaView>
              </RN.View>

              <RN.TouchableWithoutFeedback
                onPress={() =>
                  data &&
                  url &&
                  navigation.navigate("BrowserModal", {
                    title: data.title,
                    url: url.toString(),
                  })
                }
              >
                <RN.Image
                  style={storyImage()}
                  source={{ uri: metadata?.image }}
                />
              </RN.TouchableWithoutFeedback>
            </React.Fragment>
          ) : (
            <RN.SafeAreaView>
              <RN.View style={header()}>
                <RN.TouchableOpacity
                  style={backButton()}
                  onPress={() => navigation.goBack()}
                >
                  <Icon name="chevron-left" size={18} color="textAccent" />
                </RN.TouchableOpacity>
              </RN.View>
            </RN.SafeAreaView>
          )}

          {metadata && url && (
            <RN.TouchableWithoutFeedback
              onPress={() =>
                navigation.navigate("BrowserModal", {
                  title: metadata.applicationName || url.hostname,
                  url: url.origin,
                })
              }
            >
              <RN.View style={hostContainerStyle()}>
                <RN.Image
                  style={favicon()}
                  source={{ uri: metadata.favicon }}
                />

                <RN.Text
                  style={hostname()}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {metadata.applicationName || url.host.replace(/^www\./, "")}
                </RN.Text>
              </RN.View>
            </RN.TouchableWithoutFeedback>
          )}

          <RN.TouchableWithoutFeedback
            onPress={() =>
              data &&
              url &&
              navigation.navigate("BrowserModal", {
                title: data.title,
                url: url.toString(),
              })
            }
          >
            <RN.Text numberOfLines={4} adjustsFontSizeToFit style={title()}>
              {data.title}
            </RN.Text>
          </RN.TouchableWithoutFeedback>

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

          <RN.View style={storyByLine()}>
            <RN.TouchableWithoutFeedback
              onPress={() => navigation.navigate("User", { id: data.by })}
            >
              <RN.Text style={byStyle()}>@{data.by}</RN.Text>
            </RN.TouchableWithoutFeedback>
            <RN.Text style={agoStyle()}>
              {ago.format(new Date(data.time * 1000), "mini")}
            </RN.Text>
          </RN.View>

          {data.type !== "job" &&
            (data.score || ("descendants" in data && data.descendants > 0)) && (
              <RN.Text style={subtitle()}>
                {data.score && <RN.Text style={score()}>⇧{data.score}</RN.Text>}
                {"descendants" in data && (
                  <React.Fragment>
                    {" "}
                    &bull; {pluralize(data.descendants, "comment")}
                  </React.Fragment>
                )}
              </RN.Text>
            )}
        </RN.View>
      ),
    [
      data,
      metadata,
      htmlSource,
      dimensions.width,
      htmlTagStyles,
      htmlRenderersProps,
      url,
      navigation,
    ]
  );

  const refreshControl = React.useMemo(
    () => (
      <RN.RefreshControl refreshing={!data && didMount} onRefresh={onRefresh} />
    ),
    [data, didMount, onRefresh]
  );

  return (
    <RN.View style={container()}>
      <RN.FlatList
        ListHeaderComponent={listHeaderComponent}
        refreshControl={refreshControl}
        data={!data ? fauxFlatComments : "kids" in data ? data.kids : []}
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

function CommentThread({
  data,
  onRefresh,
}: {
  data: HackerNewsComment;
  onRefresh(): unknown;
}) {
  const { theme } = useDash();
  const parents = useParents(data.parent);
  const [parentStory, ...parentComments] = parents.data ?? [];
  const dimensions = RN.useWindowDimensions();
  const [didMount, setDidMount] = React.useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<StackParamList>>();
  React.useEffect(() => {
    if (data) {
      setDidMount(true);
    }
  }, [data]);
  const htmlRenderersProps = React.useMemo<Partial<RenderersProps>>(
    () => ({
      a: {
        onPress(_, url) {
          navigation.navigate("BrowserModal", { title: url, url });
        },
      },
    }),
    [navigation]
  );

  const htmlTagStyles = React.useMemo<MixedStyleRecord>(
    () => ({ a: link() }),
    [theme]
  );

  const htmlSource = React.useMemo(
    () =>
      "text" in data && {
        html: linkify(data.text),
      },
    [data]
  );

  const listHeaderComponent = React.useCallback(
    () =>
      !data || !parentStory ? null : (
        <RN.View>
          <RN.SafeAreaView>
            <RN.View style={header()}>
              <RN.TouchableOpacity
                style={backButton()}
                onPress={() => navigation.goBack()}
              >
                <Icon name="chevron-left" size={18} color="textAccent" />
              </RN.TouchableOpacity>
            </RN.View>
          </RN.SafeAreaView>

          <RN.TouchableWithoutFeedback
            onPress={() =>
              navigation.push("Thread", {
                id: parentStory.id,
              })
            }
          >
            <RN.Text numberOfLines={4} adjustsFontSizeToFit style={title()}>
              {parentStory.title}
            </RN.Text>
          </RN.TouchableWithoutFeedback>

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

          <RN.View style={storyByLine()}>
            <RN.TouchableWithoutFeedback
              onPress={() => navigation.navigate("User", { id: data.by })}
            >
              <RN.Text style={byStyle()}>@{data.by}</RN.Text>
            </RN.TouchableWithoutFeedback>
            <RN.Text style={agoStyle()}>
              {ago.format(new Date(data.time * 1000), "mini")}
            </RN.Text>
          </RN.View>
        </RN.View>
      ),
    [
      data,
      htmlSource,
      dimensions.width,
      htmlTagStyles,
      htmlRenderersProps,
      navigation,
      parentStory,
    ]
  );

  const refreshControl = React.useMemo(
    () => (
      <RN.RefreshControl refreshing={!data && didMount} onRefresh={onRefresh} />
    ),
    [data, didMount, onRefresh]
  );

  return (
    <RN.View style={container()}>
      <RN.FlatList
        ListHeaderComponent={listHeaderComponent}
        refreshControl={refreshControl}
        data={!data ? fauxFlatComments : "kids" in data ? data.kids : []}
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
  return <Comment id={item} index={index} depth={1} />;
}

function keyExtractor(item: number, index: number) {
  return item === -1 ? index.toString() : item.toString();
}

const Comment = React.memo<{ id: number; index: number; depth: number }>(
  function Comment({ id, depth }) {
    const { theme } = useDash();
    const comment = useSWR<HackerNewsComment>(
      id === -1
        ? null
        : `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
      (key) =>
        fetch(key, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }).then((res) => res.json())
    );
    const dimensions = RN.useWindowDimensions();
    const [showingReplies, setShowingReplies] = React.useState(false);
    const navigation =
      useNavigation<NativeStackNavigationProp<StackParamList>>();
    const htmlRenderersProps = React.useMemo<Partial<RenderersProps>>(
      () => ({
        a: {
          onPress(_, url) {
            navigation.navigate("BrowserModal", { title: url, url });
          },
        },
      }),
      [navigation]
    );

    const htmlTagStyles = React.useMemo<MixedStyleRecord>(
      () => ({ a: link(), pre: pre() }),
      [theme]
    );

    const htmlSource = React.useMemo(
      () =>
        comment.data && {
          html: linkify(comment.data.text),
        },
      [comment.data]
    );

    if (!comment.data) {
      return (
        <RN.View>
          <Skeleton />
        </RN.View>
      );
    }

    if (comment.data.dead || comment.data.deleted) {
      return null;
    }

    const data = comment.data;

    return (
      <React.Fragment>
        <RN.View style={commentContainer(depth)}>
          <RN.View style={byLine}>
            <RN.TouchableWithoutFeedback
              onPress={() => navigation.navigate("User", { id: data.by })}
            >
              <RN.Text style={byStyle()}>@{data.by}</RN.Text>
            </RN.TouchableWithoutFeedback>
            <RN.TouchableWithoutFeedback
              onPress={() =>
                navigation.push("Thread", {
                  id: data.id,
                })
              }
            >
              <RN.Text style={agoStyle()}>
                {ago.format(new Date(data.time * 1000), "mini")}
              </RN.Text>
            </RN.TouchableWithoutFeedback>
          </RN.View>

          {htmlSource && (
            <RenderHTML
              contentWidth={dimensions.width}
              source={htmlSource}
              baseStyle={commentContent()}
              tagsStyles={htmlTagStyles}
              defaultTextProps={htmlDefaultTextProps}
              renderersProps={htmlRenderersProps}
              enableExperimentalBRCollapsing
              enableExperimentalGhostLinesPrevention
              enableExperimentalMarginCollapsing
            />
          )}

          <RN.TouchableWithoutFeedback
            onPress={() => {
              setShowingReplies((current) => !current);
            }}
          >
            <RN.Text style={replies()}>
              {pluralize(data.kids?.length ?? 0, "reply", "replies")}
            </RN.Text>
          </RN.TouchableWithoutFeedback>
        </RN.View>

        {showingReplies &&
          data.kids &&
          data.kids.length > 0 &&
          data.kids.map((id, index) => (
            <Comment key={id} id={id} index={index} depth={depth + 1} />
          ))}
      </React.Fragment>
    );
  },
  (prev, next) => prev.id === next.id
);

const container = oneMemo<RN.ViewStyle>((t) => ({
  flex: 1,
  backgroundColor: t.color.bodyBg,
}));

const commentContainer = lazyMemo<number, RN.ViewStyle>((depth) => (t) => ({
  padding: t.space.lg,
  borderTopWidth: t.borderWidth.hairline,
  borderTopColor: t.color.accent,
  ...(depth > 1
    ? ({
        borderLeftWidth: 2,
        borderLeftColor: t.color.primary,
        marginLeft: t.space.md * (depth - 1),
      } as const)
    : {}),
}));

const header = oneMemo<RN.ViewStyle>((t) => ({
  flexDirection: "row",
  alignItems: "center",
  width: "100%",
  padding: t.space.md,
  paddingLeft: t.space.lg,
}));

const floatingHeader = oneMemo<RN.ViewStyle>((t) => ({
  position: "absolute",
  left: t.space.lg,
  top: t.space.lg,
  zIndex: 10,
}));

const backButton = oneMemo<RN.ViewStyle>((t) => ({
  alignItems: "center",
  justifyContent: "center",
  width: 18 * (t.type.size.base / 16) + t.space.sm * 2,
  height: 18 * (t.type.size.base / 16) + t.space.sm * 2,
  borderRadius: t.radius.full,
  marginRight: t.space.md,
  backgroundColor: t.color.accentLight,
}));

const title = oneMemo<RN.TextStyle>((t) => ({
  color: t.color.textPrimary,
  fontSize: t.type.size.xl,
  fontWeight: "900",
  padding: t.space.lg,
  paddingTop: t.space.md,
  paddingBottom: t.space.md,
}));

const subtitle = oneMemo<RN.TextStyle>((t) => ({
  color: t.color.textPrimary,
  fontSize: t.type.size.sm,
  fontWeight: "600",
  padding: t.space.lg,
  paddingTop: t.space.md,
}));

const score = oneMemo<RN.TextStyle>((t) => ({
  color: t.color.primary,
}));

const storyImage = oneMemo<RN.ImageStyle>((t) => ({
  width: "100%",
  height: 240,
  marginBottom: t.space.md,
}));

const hostContainerStyle = oneMemo<RN.ViewStyle>((t) => ({
  width: "100%",
  flexDirection: "row",
  alignItems: "center",
  paddingRight: t.space.lg,
  paddingLeft: t.space.lg,
  paddingTop: t.space.md,
  paddingBottom: t.space.md,
}));

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

const content = oneMemo((t) => ({
  color: t.color.textPrimary,
  fontSize: t.type.size.sm,
  fontWeight: "400",
  padding: t.space.lg,
  paddingTop: 0,
  paddingBottom: 0,
}));

const commentContent = oneMemo((t) => ({
  color: t.color.textPrimary,
  fontSize: t.type.size.xs,
  fontWeight: "300",
}));

const storyByLine = oneMemo<RN.ViewStyle>((t) => ({
  width: "100%",
  flexDirection: "row",
  justifyContent: "space-between",
  paddingLeft: t.space.lg,
  paddingRight: t.space.lg,
  paddingBottom: t.space.md,
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

const replies = oneMemo<RN.TextStyle>((t) => ({
  color: t.color.textAccent,
  fontSize: t.type.size["2xs"],
  fontWeight: "300",
  padding: t.space.sm,
  paddingTop: t.space.md,
  paddingLeft: 0,
  width: "100%",
}));

const agoStyle = oneMemo<RN.TextStyle>((t) => ({
  color: t.color.textAccent,
  fontSize: t.type.size["2xs"],
  fontWeight: "300",
}));

const link = oneMemo((t) => ({
  color: t.color.textPrimary,
  fontWeight: "600",
  textDecorationLine: "underline",
  textDecorationColor: t.color.primary,
}));

const pre = oneMemo((t) => ({
  color: t.color.textPrimary,
  backgroundColor: t.color.accent,
  borderRadius: t.radius.xl,
  padding: t.space.lg,
  paddingBottom: t.space.sm,
  fontSize: t.type.size["2xs"],
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

export interface ThreadProps
  extends NativeStackScreenProps<StackParamList, "Thread"> {}
