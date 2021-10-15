import useSWR, { useSWRConfig } from "swr";
import type {
  HackerNewsAsk,
  HackerNewsComment,
  HackerNewsPoll,
  HackerNewsStory,
} from "@/types/hn-api";

export function useParents(firstParent?: number | null) {
  const { cache } = useSWRConfig();

  return useSWR<
    [
      story: HackerNewsStory | HackerNewsPoll | HackerNewsAsk,
      ...other: HackerNewsComment[]
    ]
  >(
    firstParent === void 0 || firstParent === null
      ? null
      : [
          `https://hacker-news.firebaseio.com/v0/item/${firstParent}.json`,
          "parents",
        ],
    async (key) => {
      let next =
        cache.get(key) ??
        (await fetch(key, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }).then<
          Promise<
            HackerNewsStory | HackerNewsPoll | HackerNewsAsk | HackerNewsComment
          >
        >((res) => res.json()));
      const parents: [
        story: HackerNewsStory | HackerNewsPoll | HackerNewsAsk,
        ...other: HackerNewsComment[]
      ] = [next as any];
      let foundStory = next.type === "story" || next.type === "poll";
      cache.set(
        `https://hacker-news.firebaseio.com/v0/item/${firstParent}.json`,
        next
      );

      while (!foundStory) {
        const key = `https://hacker-news.firebaseio.com/v0/item/${next.parent}.json`;
        next =
          cache.get(key) ??
          (await fetch(key, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }).then<
            Promise<
              | HackerNewsStory
              | HackerNewsPoll
              | HackerNewsAsk
              | HackerNewsComment
            >
          >((res) => res.json()));
        parents.unshift(next);
        cache.set(key, next);
        foundStory = next.type === "story" || next.type === "poll";
      }

      return parents;
    }
  );
}
