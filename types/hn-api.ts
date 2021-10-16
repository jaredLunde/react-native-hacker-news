export type HackerNewsItem =
  | HackerNewsStory
  | HackerNewsAsk
  | HackerNewsJob
  | HackerNewsComment
  | HackerNewsPoll;

export type HackerNewsItemBase = {
  /**
   * The item's unique id
   */
  id: number;
  /**
   * The username of the item's author.
   */
  by: string;
  /**
   * In the case of stories or polls, the total comment count.
   */
  descendants: number;
  /**
   * The ids of the item's comments, in ranked display order.
   */
  kids?: number[];
  /**
   * A list of related pollopts, in display order.
   */
  parts: number[];
  /**
   * The story's score, or the votes for a pollopt.
   */
  score: number;
  /**
   * Creation date of the item, in Unix Time.
   */
  time: number;
  /**
   * The title of the story, poll or job.
   */
  title: string;
  /**
   * The comment, story, or poll text. HTML.
   */
  text: string;
  /**
   * The comment's parent: either another comment or the relevant story
   */
  parent: number;
  /**
   * The pollopt's associated poll.
   */
  poll: number;
  /**
   * The URL of the story.
   */
  url: string;
  /**
   * `true` if the item is deleted.
   */
  deleted: boolean;
  /**
   * `true` if the item is dead.
   */
  dead: boolean;
};

export type HackerNewsStory = Pick<
  HackerNewsItemBase,
  | "by"
  | "descendants"
  | "id"
  | "kids"
  | "score"
  | "time"
  | "title"
  | "url"
  | "deleted"
  | "dead"
> & {
  type: "story";
};

export type HackerNewsComment = Pick<
  HackerNewsItemBase,
  "by" | "id" | "kids" | "parent" | "time" | "text" | "deleted" | "dead"
> & {
  type: "comment";
};

export type HackerNewsAsk = (
  | Pick<
      HackerNewsItemBase,
      | "by"
      | "descendants"
      | "id"
      | "kids"
      | "score"
      | "time"
      | "title"
      | "text"
      | "deleted"
      | "dead"
    >
  | (Pick<
      HackerNewsItemBase,
      | "by"
      | "descendants"
      | "id"
      | "kids"
      | "score"
      | "time"
      | "title"
      | "text"
      | "deleted"
      | "dead"
    > & {
      url: undefined;
    })
) & {
  type: "story";
};

export type HackerNewsJob = Pick<
  HackerNewsItemBase,
  "by" | "id" | "score" | "time" | "title" | "text" | "url" | "deleted" | "dead"
> & {
  type: "job";
};

export type HackerNewsPoll = Pick<
  HackerNewsItemBase,
  | "by"
  | "descendants"
  | "id"
  | "kids"
  | "parts"
  | "score"
  | "time"
  | "title"
  | "text"
  | "deleted"
  | "dead"
> & {
  type: "poll";
};

export type HackerNewsPollOpt = Pick<
  HackerNewsItemBase,
  | "by"
  | "id"
  | "poll"
  | "score"
  | "time"
  | "title"
  | "text"
  | "deleted"
  | "dead"
> & {
  type: "pollopt";
};

export type HackerNewsUser = {
  /**
   * The user's unique username. Case-sensitive. Required.
   */
  id: string;
  /**
   * The user's optional self-description. HTML.
   */
  about: string;
  /**
   * Creation date of the user, in Unix Time.
   */
  created: number;
  /**
   * The user's karma.
   */
  karma: number;
  /**
   * List of the user's stories, polls and comments.
   */
  submitted: number[];
};

export type StoryFilters = "top" | "new" | "best" | "show" | "ask" | "job";
