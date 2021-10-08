import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Linking from "expo-linking";
import React from "react";
import { Share, useColorScheme, useWindowDimensions } from "react-native";
import type { WebViewNavigation } from "react-native-webview";
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  WebView,
} from "@/components/primitives";
import { themes, useDash } from "@/dash";
import type { StackParamList } from "@/screens/routers";

export function BrowserModal({ navigation, route }: BrowserModalProps) {
  const { theme } = useDash();
  const colorScheme = useColorScheme();
  const dimensions = useWindowDimensions();
  const ref = React.useRef<WebViewRef>(null);
  const [navigationState, setNavigationState] =
    React.useState<WebViewNavigation | null>(null);
  const color =
    themes[theme === "default" ? colorScheme || "light" : theme].color;

  return (
    <View
      style={(t) => ({
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: t.color.bodyBg,
      })}
    >
      <View
        style={(t) => ({
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
          padding: t.space.md,
          borderBottomColor: t.color.accent,
          borderBottomWidth: t.borderWidth.hairline,
        })}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={(t) => ({
            alignItems: "center",
            justifyContent: "center",
            width: 24 + t.space.sm * 2,
            height: 24 + t.space.sm * 2,
            borderRadius: t.radius.full,
            marginRight: t.space.md,
            backgroundColor:
              theme === "dark" ? t.color.accentLight : t.color.accentLight,
          })}
        >
          <Feather name="x" size={24} color={color.textPrimary} />
        </TouchableOpacity>

        <Text
          style={(t) => ({
            color: t.color.textAccent,
            fontSize: t.type.size["xs"],
            fontWeight: "700",
            flex: 1,
          })}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {route.params.title || ""}
        </Text>
      </View>
      <WebView
        ref={ref}
        originWhitelist={["*"]}
        allowsLinkPreview
        allowsInlineMediaPlayback
        allowsBackForwardNavigationGestures
        sharedCookiesEnabled
        enableApplePay
        onNavigationStateChange={setNavigationState}
        style={(t) => ({
          width: dimensions.width,
          height: "100%",
        })}
        source={{ uri: route.params.url }}
      />

      <SafeAreaView
        style={(t) => ({
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderTopColor: t.color.accent,
          borderTopWidth: t.borderWidth.hairline,
        })}
      >
        <TouchableOpacity
          onPress={() => ref.current?.goBack()}
          style={(t) => ({ padding: t.space.lg })}
        >
          <Feather
            name="chevron-left"
            size={30}
            color={
              navigationState?.canGoBack ? color.textPrimary : color.textAccent
            }
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => ref.current?.goForward()}
          style={(t) => ({ padding: t.space.lg })}
        >
          <Feather
            name="chevron-right"
            size={30}
            color={
              navigationState?.canGoForward
                ? color.textPrimary
                : color.textAccent
            }
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            Share.share({
              title: navigationState?.title ?? route.params.title,
              url: navigationState?.url ?? route.params.url,
            })
          }
          style={(t) => ({ padding: t.space.lg })}
        >
          <Feather name="share" size={24} color={color.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            Linking.openURL(navigationState?.url ?? route.params.url)
          }
          style={(t) => ({ padding: t.space.lg })}
        >
          <MaterialCommunityIcons
            name="apple-safari"
            size={30}
            color={color.textPrimary}
          />
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

export interface BrowserModalProps
  extends NativeStackScreenProps<StackParamList, "BrowserModal"> {}

type WebViewRef = {
  goBack(): void;
  goForward(): void;
  postMessage(message: string): void;
};
