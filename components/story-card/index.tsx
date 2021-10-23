import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as htmlEntities from "html-entities";
import * as React from "react";
import * as RN from "react-native";
import stripTags from "striptags";
import useSWR from "swr";
import { Skeleton } from "@/components/skeleton";
import { lazyMemo, oneMemo, useDash } from "@/dash";
import { useMetadata } from "@/hooks/use-metadata";
import { useParents } from "@/hooks/use-parents";
import type { StackParamList } from "@/screens/routers";
import type {
  HackerNewsAsk,
  HackerNewsComment,
  HackerNewsItem,
  HackerNewsJob,
  HackerNewsPoll,
  HackerNewsStory,
} from "@/types/hn-api";
import { ago } from "@/utils/ago";
import { pluralize } from "@/utils/pluralize";

export const StoryCard = React.memo(
  function StoryCard({ index, id }: { index: number; id: number | null }) {
    useDash();
    const story = useSWR<HackerNewsItem>(
      id === -1
        ? null
        : `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
      (key) =>
        fetch(key, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }).then((res) => res.json())
    );

    if (!story.data) {
      return (
        <RN.View style={storyContainer(index)}>
          <Skeleton style={storySkeleton(index)} />
        </RN.View>
      );
    }

    if (story.data.deleted || story.data.dead) {
      return null;
    }

    return (!("url" in story.data) || story.data.url === undefined) &&
      story.data.type === "story" ? (
      <AskStory data={story.data} index={index} />
    ) : story.data.type === "job" ? (
      <JobStory data={story.data} index={index} />
    ) : story.data.type === "comment" ? (
      <CommentStory data={story.data} index={index} />
    ) : story.data.type === "poll" ? (
      <PollStory data={story.data} index={index} />
    ) : (
      <Story data={story.data} index={index} />
    );
  },
  (prev, next) => prev.id === next.id && prev.index === next.index
);

function Story({ data, index }: { data: HackerNewsStory; index: number }) {
  const url = new URL(data.url);
  const navigation = useNavigation<NativeStackNavigationProp<StackParamList>>();
  const metadata = useMetadata(url);

  if (!metadata) {
    return (
      <RN.View style={storyContainer(index)}>
        <Skeleton style={storySkeleton(index)} />
      </RN.View>
    );
  }

  return (
    <RN.View style={storyContainer(index)}>
      {metadata?.image ? (
        <RN.TouchableWithoutFeedback
          onPress={() =>
            navigation.push("BrowserModal", {
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

      <RN.TouchableWithoutFeedback
        onPress={() =>
          navigation.push("BrowserModal", {
            title: metadata.applicationName || url.hostname,
            url: url.origin,
          })
        }
      >
        <RN.View style={hostContainerStyle}>
          <RN.Image style={favicon()} source={{ uri: metadata.favicon }} />

          <RN.Text style={hostname()} numberOfLines={1} ellipsizeMode="tail">
            {metadata.applicationName || url.host.replace(/^www\./, "")}
          </RN.Text>
        </RN.View>
      </RN.TouchableWithoutFeedback>

      <RN.TouchableWithoutFeedback
        onPress={() =>
          navigation.push("BrowserModal", {
            title: data.title,
            url: url.toString(),
          })
        }
      >
        <RN.Text
          style={storyTitle(index)}
          adjustsFontSizeToFit
          numberOfLines={
            index === 0 && !metadata.image
              ? 5
              : index < 5 && metadata.image
              ? 4
              : 7
          }
        >
          {data.title}
        </RN.Text>
      </RN.TouchableWithoutFeedback>

      <RN.View>
        <RN.View style={byLine}>
          <RN.TouchableWithoutFeedback
            onPress={() => navigation.push("User", { id: data.by })}
          >
            <RN.Text style={byStyle()}>@{data.by}</RN.Text>
          </RN.TouchableWithoutFeedback>
          <RN.Text style={agoStyle()}>
            {ago.format(new Date(data.time * 1000), "mini")}
          </RN.Text>
        </RN.View>

        <RN.Text style={footerText()}>
          <RN.Text style={score()}>⇧{data.score}</RN.Text> &bull;{" "}
          <RN.TouchableWithoutFeedback
            onPress={() => navigation.push("Thread", { id: data.id })}
          >
            <RN.Text style={commentsStyle}>
              {pluralize(data.descendants, "comment")}
            </RN.Text>
          </RN.TouchableWithoutFeedback>
        </RN.Text>
      </RN.View>
    </RN.View>
  );
}

function JobStory({ data, index }: { data: HackerNewsJob; index: number }) {
  const url = data.url ? new URL(data.url) : undefined;
  const navigation = useNavigation<NativeStackNavigationProp<StackParamList>>();
  const metadata = useMetadata(url);

  if (!metadata) {
    return (
      <RN.View style={storyContainer(index)}>
        <Skeleton style={storySkeleton(index)} />
      </RN.View>
    );
  }

  return (
    <RN.View style={storyContainer(index)}>
      {url && metadata?.image ? (
        <RN.TouchableWithoutFeedback
          onPress={() =>
            navigation.push("BrowserModal", {
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

      {url && (
        <RN.TouchableWithoutFeedback
          onPress={() =>
            navigation.push("BrowserModal", {
              title: metadata.applicationName || url.hostname,
              url: url.origin,
            })
          }
        >
          <RN.View style={hostContainerStyle}>
            <RN.Image style={favicon()} source={{ uri: metadata.favicon }} />

            <RN.Text style={hostname()} numberOfLines={1} ellipsizeMode="tail">
              {metadata.applicationName || url.host.replace(/^www\./, "")}
            </RN.Text>
          </RN.View>
        </RN.TouchableWithoutFeedback>
      )}

      <RN.TouchableWithoutFeedback
        onPress={() => {
          if (url) {
            navigation.push("BrowserModal", {
              title: data.title,
              url: url.toString(),
            });
          } else {
            navigation.push("Thread", {
              id: data.id,
            });
          }
        }}
      >
        <RN.Text
          style={storyTitle(index)}
          adjustsFontSizeToFit
          numberOfLines={
            index === 0 && !metadata.image
              ? 5
              : index < 5 && metadata.image
              ? 4
              : 7
          }
        >
          {data.title}
        </RN.Text>
      </RN.TouchableWithoutFeedback>

      {data.text && (
        <RN.TouchableWithoutFeedback
          onPress={() => {
            if (url) {
              navigation.push("BrowserModal", {
                title: data.title,
                url: url.toString(),
              });
            } else {
              navigation.push("Thread", {
                id: data.id,
              });
            }
          }}
        >
          <RN.Text ellipsizeMode="tail" style={storyText()} numberOfLines={4}>
            {stripTags(htmlEntities.decode(data.text), [], " ")}
          </RN.Text>
        </RN.TouchableWithoutFeedback>
      )}

      <RN.View>
        <RN.View style={byLine}>
          <RN.TouchableWithoutFeedback
            onPress={() => navigation.push("User", { id: data.by })}
          >
            <RN.Text style={byStyle()}>@{data.by}</RN.Text>
          </RN.TouchableWithoutFeedback>
          <RN.Text style={agoStyle()}>
            {ago.format(new Date(data.time * 1000), "mini")}
          </RN.Text>
        </RN.View>
      </RN.View>
    </RN.View>
  );
}

function AskStory({ data, index }: { data: HackerNewsAsk; index: number }) {
  const navigation = useNavigation<NativeStackNavigationProp<StackParamList>>();

  return (
    <RN.View style={storyContainer(index)}>
      <RN.TouchableWithoutFeedback
        onPress={() =>
          navigation.push("Thread", {
            id: data.id,
          })
        }
      >
        <RN.Text
          style={storyTitle(index)}
          adjustsFontSizeToFit
          numberOfLines={index === 0 ? 5 : 7}
        >
          {data.title}
        </RN.Text>
      </RN.TouchableWithoutFeedback>

      {data.text && (
        <RN.TouchableWithoutFeedback
          onPress={() =>
            navigation.push("Thread", {
              id: data.id,
            })
          }
        >
          <RN.Text ellipsizeMode="tail" style={storyText()} numberOfLines={4}>
            {stripTags(htmlEntities.decode(data.text), [], " ")}
          </RN.Text>
        </RN.TouchableWithoutFeedback>
      )}

      <RN.View>
        <RN.View style={byLine}>
          <RN.TouchableWithoutFeedback
            onPress={() => navigation.push("User", { id: data.by })}
          >
            <RN.Text style={byStyle()}>@{data.by}</RN.Text>
          </RN.TouchableWithoutFeedback>
          <RN.Text style={agoStyle()}>
            {ago.format(new Date(data.time * 1000), "mini")}
          </RN.Text>
        </RN.View>

        <RN.Text style={footerText()}>
          <RN.Text style={score()}>⇧{data.score}</RN.Text> &bull;{" "}
          <RN.TouchableWithoutFeedback
            onPress={() => navigation.push("Thread", { id: data.id })}
          >
            <RN.Text style={commentsStyle}>
              {pluralize(data.descendants, "comment")}
            </RN.Text>
          </RN.TouchableWithoutFeedback>
        </RN.Text>
      </RN.View>
    </RN.View>
  );
}

function PollStory({ data, index }: { data: HackerNewsPoll; index: number }) {
  return null;
}

function CommentStory({
  data,
  index,
}: {
  data: HackerNewsComment;
  index: number;
}) {
  const navigation = useNavigation<NativeStackNavigationProp<StackParamList>>();
  const parents = useParents(data.parent);

  if (!parents.data) {
    return (
      <RN.View style={storyContainer(index)}>
        <Skeleton style={storySkeleton(index)} />
      </RN.View>
    );
  }
  const parentData = parents.data[0];

  return (
    <RN.View style={storyContainer(index)}>
      <RN.TouchableWithoutFeedback
        onPress={() =>
          navigation.push("Thread", {
            id: parentData.id,
          })
        }
      >
        <RN.Text style={commentStoryTitle()}>{parentData.title}</RN.Text>
      </RN.TouchableWithoutFeedback>
      <RN.TouchableWithoutFeedback
        onPress={() =>
          navigation.push("Thread", {
            id: data.id,
          })
        }
      >
        <RN.Text
          ellipsizeMode="tail"
          style={commentStoryText()}
          numberOfLines={4}
        >
          {stripTags(htmlEntities.decode(data.text), [], " ")}
        </RN.Text>
      </RN.TouchableWithoutFeedback>

      <RN.View style={byLine}>
        <RN.TouchableWithoutFeedback
          onPress={() =>
            navigation.push("Thread", {
              id: data.id,
            })
          }
        >
          <RN.Text style={byStyle()}>
            {pluralize(data.kids?.length ?? 0, "reply", "replies")}
          </RN.Text>
        </RN.TouchableWithoutFeedback>
        <RN.Text style={agoStyle()}>
          {ago.format(new Date(data.time * 1000), "mini")}
        </RN.Text>
      </RN.View>
    </RN.View>
  );
}

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

const score = oneMemo<RN.TextStyle>((t) => ({
  color: t.color.primary,
  fontWeight: "700",
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
  width: t.type.size.base,
  height: t.type.size.base,
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
  fontSize: t.type.size[index === 0 ? "6xl" : index < 5 ? "base" : "sm"],
  fontWeight: index === 0 ? "900" : index < 5 ? "800" : "700",
  letterSpacing: index < 4 ? t.type.tracking.tighter : t.type.tracking.tight,
  paddingTop: t.space.sm,
  paddingBottom: t.space.sm,
}));

const storyText = oneMemo<RN.TextStyle>((t) => ({
  color: t.color.textAccent,
  fontSize: t.type.size.xs,
  fontWeight: "400",
  letterSpacing: t.type.tracking.tight,
  paddingTop: t.space.sm,
  paddingBottom: t.space.sm,
}));

const commentStoryTitle = oneMemo<RN.TextStyle>((t) => ({
  color: t.color.textAccent,
  fontSize: t.type.size.xs,
  fontWeight: "700",
  letterSpacing: t.type.tracking.tight,
  paddingTop: t.space.sm,
  paddingBottom: t.space.sm,
}));

const commentStoryText = oneMemo<RN.TextStyle>((t) => ({
  color: t.color.textPrimary,
  fontSize: t.type.size.xs,
  fontWeight: "400",
  letterSpacing: t.type.tracking.tight,
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
