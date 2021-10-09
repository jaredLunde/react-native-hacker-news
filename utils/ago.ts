import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";

TimeAgo.addLocale(en);
export const ago = new TimeAgo("en-US");
