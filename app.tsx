import "react-native-url-polyfill/auto";
import "intl";
import "intl/locale-data/jsonp/en";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { registerRootComponent } from "expo";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import * as RN from "react-native";
import { enableScreens } from "react-native-screens";
import { SWRConfig } from "swr";
import { DashProvider, lazyMemo, oneMemo, useDash } from "@/dash";
import { BrowserModal } from "@/screens/browser-modal";
import { Preferences, usePreferences } from "@/screens/preferences";
import {
  AskStack,
  HomeStack,
  JobsStack,
  ShowStack,
  Tab,
} from "@/screens/routers";
import { Stories } from "@/screens/stories";
import { Thread } from "@/screens/thread";
import { User } from "@/screens/user";

registerRootComponent(App);

function App() {
  enableScreens(true);

  return (
    <SWRConfig
      value={{
        provider: () => new Map(),
        isVisible: () => {
          return true;
        },
        initFocus(callback) {
          let appState = RN.AppState.currentState;

          const onAppStateChange = (nextAppState: typeof appState) => {
            /* If it's resuming from background or inactive mode to active one */
            if (
              appState.match(/inactive|background/) &&
              nextAppState === "active"
            ) {
              callback();
            }
            appState = nextAppState;
          };

          // Subscribe to the app state change events
          const listener = RN.AppState.addEventListener(
            "change",
            onAppStateChange
          );

          return () => {
            listener.remove();
          };
        },
      }}
    >
      <DashProvider disableAutoThemeChange>
        <AppStatusBar />
        <NavigationContainer>
          <Tabs />
        </NavigationContainer>
      </DashProvider>
    </SWRConfig>
  );
}

function AppStatusBar() {
  const { theme } = useDash();
  return (
    <StatusBar
      style={theme === "light" ? "dark" : theme === "dark" ? "light" : "auto"}
    />
  );
}

function Tabs() {
  useDash();
  usePreferences();

  return (
    <RN.View style={sceneContainer()}>
      <Tab.Navigator
        detachInactiveScreens
        sceneContainerStyle={sceneContainer()}
        screenOptions={{ headerShown: false }}
        tabBar={TabBar}
      >
        <Tab.Screen name="Home" component={HomeScreens} />
        <Tab.Screen name="Show" component={ShowScreens} />
        <Tab.Screen name="Ask" component={AskScreens} />
        <Tab.Screen name="Jobs" component={JobsScreens} />
      </Tab.Navigator>
    </RN.View>
  );
}

const sceneContainer = oneMemo<RN.ViewStyle>((t) => ({
  height: "100%",
  width: "100%",
  backgroundColor: t.color.bodyBg,
}));

function TabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  return (
    <TabBarBase
      state={state}
      descriptors={descriptors}
      navigation={navigation}
      insets={insets}
    />
  );
}

function TabBarBase({ state, descriptors, navigation }: BottomTabBarProps) {
  useDash();

  return (
    <RN.SafeAreaView style={tabBar()}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        return (
          <RN.Pressable
            key={route.name}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={() => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                // The `merge: true` option makes sure that the params inside
                // the tab screen are preserved
                // @ts-expect-error: TODO
                navigation.navigate({ name: route.name, merge: true });
              }
            }}
            onLongPress={() => {
              navigation.emit({
                type: "tabLongPress",
                target: route.key,
              });
            }}
            style={tabBarTab(isFocused)}
          >
            <RN.Text style={tabBarLabel(isFocused)}>{label}</RN.Text>
          </RN.Pressable>
        );
      })}
    </RN.SafeAreaView>
  );
}

const tabBar = oneMemo<RN.ViewStyle>((t) => ({
  flexDirection: "row",
  width: "100%",
  backgroundColor: t.color.headerBg,
  borderTopWidth: t.borderWidth.hairline,
  borderTopColor: t.color.accent,
}));

const tabBarLabel = lazyMemo<boolean, RN.TextStyle>((isFocused) => (t) => ({
  color: isFocused ? t.color.primary : t.color.textAccent,
  fontSize: t.type.size.sm,
  fontWeight: "700",
  margin: 0,
  textAlign: "center",
}));

const tabBarTab = lazyMemo<boolean, RN.ViewStyle>((isFocused) => (t) => ({
  borderTopColor: isFocused ? t.color.primary : t.color.headerBg,
  borderTopWidth: 4,
  flex: 1,
  padding: t.space.md,
  justifyContent: "center",
  alignItems: "center",
}));

function HomeScreens() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <HomeStack.Screen
        name="Stories"
        component={Stories}
        initialParams={{ filter: "top" }}
      />
      <HomeStack.Screen name="User" component={User} />
      <HomeStack.Screen name="Thread" component={Thread} />
      <HomeStack.Screen name="Preferences" component={Preferences} />
      <HomeStack.Group
        screenOptions={{ headerShown: false, presentation: "modal" }}
      >
        <HomeStack.Screen name="BrowserModal" component={BrowserModal} />
      </HomeStack.Group>
    </HomeStack.Navigator>
  );
}

function ShowScreens() {
  return (
    <ShowStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <ShowStack.Screen
        name="Stories"
        component={Stories}
        initialParams={{ filter: "show" }}
      />
      <ShowStack.Screen name="User" component={User} />
      <ShowStack.Screen name="Thread" component={Thread} />
      <ShowStack.Screen name="Preferences" component={Preferences} />
      <ShowStack.Group
        screenOptions={{ headerShown: false, presentation: "modal" }}
      >
        <ShowStack.Screen name="BrowserModal" component={BrowserModal} />
      </ShowStack.Group>
    </ShowStack.Navigator>
  );
}

function AskScreens() {
  return (
    <AskStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AskStack.Screen
        name="Stories"
        component={Stories}
        initialParams={{ filter: "ask" }}
      />
      <AskStack.Screen name="User" component={User} />
      <AskStack.Screen name="Thread" component={Thread} />
      <AskStack.Screen name="Preferences" component={Preferences} />
      <AskStack.Group
        screenOptions={{ headerShown: false, presentation: "modal" }}
      >
        <AskStack.Screen name="BrowserModal" component={BrowserModal} />
      </AskStack.Group>
    </AskStack.Navigator>
  );
}

function JobsScreens() {
  return (
    <JobsStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <JobsStack.Screen
        name="Stories"
        component={Stories}
        initialParams={{ filter: "job" }}
      />
      <JobsStack.Screen name="User" component={User} />
      <JobsStack.Screen name="Thread" component={Thread} />
      <JobsStack.Screen name="Preferences" component={Preferences} />
      <JobsStack.Group
        screenOptions={{ headerShown: false, presentation: "modal" }}
      >
        <JobsStack.Screen name="BrowserModal" component={BrowserModal} />
      </JobsStack.Group>
    </JobsStack.Navigator>
  );
}
