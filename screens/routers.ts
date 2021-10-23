import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { StoryFilters } from "@/types/hn-api";

export const HomeStack = createNativeStackNavigator<StackParamList>();
export const ShowStack = createNativeStackNavigator<StackParamList>();
export const AskStack = createNativeStackNavigator<StackParamList>();
export const JobsStack = createNativeStackNavigator<StackParamList>();
export const Tab = createBottomTabNavigator<TabParamList>();

export type StackParamList = {
  Stories: { filter: StoryFilters };
  User: { id: string };
  BrowserModal: { title: string | undefined; url: string };
  Thread: { id: number };
  Preferences: {};
};

export type TabParamList = {
  Home: undefined;
  Show: undefined;
  Ask: undefined;
  Jobs: undefined;
};
