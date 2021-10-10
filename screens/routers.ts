import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { StoryFilters } from "@/types/hn-api";

export const HomeStack = createNativeStackNavigator<HomeStackParamList>();
export const ShowStack = createNativeStackNavigator<HomeStackParamList>();
export const AskStack = createNativeStackNavigator<HomeStackParamList>();
export const JobsStack = createNativeStackNavigator<HomeStackParamList>();
export const Tab = createBottomTabNavigator<TabParamList>();

export type HomeStackParamList = {
  Stories: { filter: StoryFilters };
  User: { id: string };
  BrowserModal: { title: string | undefined; url: string };
};

export type TabParamList = {
  Home: undefined;
  Show: undefined;
  Ask: undefined;
  Jobs: undefined;
};
