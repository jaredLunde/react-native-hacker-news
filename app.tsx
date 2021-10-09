import "react-native-url-polyfill/auto";
import "intl";
import "intl/locale-data/jsonp/en";
import { NavigationContainer } from "@react-navigation/native";
import type { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { registerRootComponent } from "expo";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import * as RN from "react-native";
import { SWRConfig } from "swr";
import logo from "@/assets/logo.png";
import { DashProvider, styledMemo } from "@/dash";
import { BrowserModal } from "@/screens/browser-modal";
import { Home } from "@/screens/home";
import { Stack } from "@/screens/routers";

registerRootComponent(App);

function App() {
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
          RN.AppState.addEventListener("change", onAppStateChange);

          return () => {
            RN.AppState.removeEventListener("change", onAppStateChange);
          };
        },
      }}
    >
      <DashProvider>
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
  const colorScheme = RN.useColorScheme();

  return (
    <StyledHeader>
      <StatusBar
        style={
          colorScheme === "light"
            ? "dark"
            : colorScheme === "dark"
            ? "light"
            : "auto"
        }
      />

      <LogoContainer>
        <LogoMark source={logo} />
        <LogoType>HN</LogoType>
      </LogoContainer>
    </StyledHeader>
  );
}

const StyledHeader = styledMemo(RN.SafeAreaView, (t) => ({
  backgroundColor: t.color.headerBg,
}));

const LogoContainer = styledMemo(RN.View, (t) => ({
  flexDirection: "row",
  flexWrap: "nowrap",
  alignItems: "center",
  justifyContent: "flex-start",
  width: "100%",
  paddingTop: t.space.sm,
  paddingBottom: t.space.md,
  paddingRight: t.space.lg,
  paddingLeft: t.space.lg,
}));

const LogoMark = styledMemo(RN.Image, (t) => ({
  width: t.type.size.lg,
  height: t.type.size.lg,
  borderRadius: t.radius.md,
  marginRight: t.space.md,
}));

const LogoType = styledMemo(RN.Text, (t) => ({
  fontSize: t.type.size.lg,
  color: t.color.textPrimary,
  fontWeight: "900",
}));
