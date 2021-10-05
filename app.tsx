import "react-native-url-polyfill/auto";
import { NavigationContainer } from "@react-navigation/native";
import type { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { registerRootComponent } from "expo";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { useColorScheme } from "react-native";
import logo from "@/assets/logo.png";
import { Image, SafeAreaView, Text, View } from "@/components/primitives";
import { DashProvider, responsiveSize } from "@/dash";
import { Home } from "@/screens/home";

registerRootComponent(App);

const Stack = createNativeStackNavigator();

function App() {
  const colorScheme = useColorScheme();
  return (
    <DashProvider theme={colorScheme || "light"}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            header: Header,
          }}
        >
          <Stack.Screen name="Home" component={Home} />
        </Stack.Navigator>
      </NavigationContainer>
    </DashProvider>
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
            color: t.color.primaryText,
            fontWeight: "900",
          })}
        >
          HN
        </Text>
      </View>
    </SafeAreaView>
  );
}
