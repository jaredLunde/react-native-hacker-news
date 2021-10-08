import { createNativeStackNavigator } from "@react-navigation/native-stack";

export const Stack = createNativeStackNavigator<StackParamList>();

export type StackParamList = {
  Home: undefined;
  BrowserModal: { title: string | undefined; url: string };
};
