import "react-native-url-polyfill/auto";
import "intl";
import "intl/locale-data/jsonp/en";
import { NavigationContainer } from "@react-navigation/native";
import type { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { registerRootComponent } from "expo";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { AppState, useColorScheme } from "react-native";
import { SWRConfig } from "swr";
import logo from "@/assets/logo.png";
import { Image, SafeAreaView, Text, View } from "@/components/primitives";
import { DashProvider } from "@/dash";
import { BrowserModal } from "@/screens/browser-modal";
import { Home } from "@/screens/home";
import { Stack } from "@/screens/routers";

registerRootComponent(App);

function App() {
  const colorScheme = useColorScheme();
  return (
    <SWRConfig
      value={{
        provider: () => new Map(),
        isVisible: () => {
          return true;
        },
        initFocus(callback) {
          let appState = AppState.currentState;

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
          AppState.addEventListener("change", onAppStateChange);

          return () => {
            AppState.removeEventListener("change", onAppStateChange);
          };
        },
      }}
    >
      <DashProvider theme={colorScheme || "light"}>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              header: Header,
            }}
          >
            <Stack.Screen name="Home" component={Home} />
            <Stack.Group
              screenOptions={{ headerShown: false, presentation: "modal" }}
            >
              <Stack.Screen name="BrowserModal" component={BrowserModal} />
            </Stack.Group>
          </Stack.Navigator>
        </NavigationContainer>
      </DashProvider>
    </SWRConfig>
  );
}

function Header(props: NativeStackHeaderProps) {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaView
      style={(t) => ({
        backgroundColor: t.color.headerBg,
      })}
    >
      <StatusBar
        style={
          colorScheme === "light"
            ? "dark"
            : colorScheme === "dark"
            ? "light"
            : "auto"
        }
      />
      <View
        style={(t) => ({
          flexDirection: "row",
          flexWrap: "nowrap",
          alignItems: "center",
          justifyContent: "flex-start",
          width: "100%",
          paddingTop: t.space.sm,
          paddingBottom: t.space.md,
          paddingRight: t.space.lg,
          paddingLeft: t.space.lg,
        })}
      >
        <Image
          source={logo}
          style={(t) => ({
            width: t.type.size.lg,
            height: t.type.size.lg,
            borderRadius: t.radius.md,
            marginRight: t.space.md,
          })}
        />
        <Text
          style={(t) => ({
            fontSize: t.type.size.lg,
            color: t.color.textPrimary,
            fontWeight: "900",
          })}
        >
          HN
        </Text>
      </View>
    </SafeAreaView>
  );
}
