import {
  Feather,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Linking from "expo-linking";
import React from "react";
import * as RN from "react-native";
import { Share, useColorScheme, useWindowDimensions } from "react-native";
import type { WebViewNavigation } from "react-native-webview";
import { WebView } from "react-native-webview";
import type { AppThemeNames } from "@/dash";
import { styledMemo, themes, useDash } from "@/dash";
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
    <Container>
      <ModalHeader>
        <CloseButton theme={theme} onPress={() => navigation.goBack()}>
          <Feather name="x" size={20} color={color.textPrimary} />
        </CloseButton>

        <Title numberOfLines={1} ellipsizeMode="tail">
          {route.params.title || ""}
        </Title>
      </ModalHeader>

      <BrowserView
        ref={ref}
        originWhitelist={["*"]}
        allowsLinkPreview
        allowsInlineMediaPlayback
        allowsBackForwardNavigationGestures
        sharedCookiesEnabled
        enableApplePay
        onNavigationStateChange={setNavigationState}
        source={{ uri: route.params.url }}
        width={dimensions.width}
      />

      <Footer>
        <FooterButton onPress={() => ref.current?.goBack()}>
          <Feather
            name="chevron-left"
            size={30}
            color={
              navigationState?.canGoBack ? color.textPrimary : color.textAccent
            }
          />
        </FooterButton>

        <FooterButton onPress={() => ref.current?.goForward()}>
          <Feather
            name="chevron-right"
            size={30}
            color={
              navigationState?.canGoForward
                ? color.textPrimary
                : color.textAccent
            }
          />
        </FooterButton>

        <FooterButton
          onPress={() =>
            Share.share({
              title: navigationState?.title ?? route.params.title,
              url: navigationState?.url ?? route.params.url,
            })
          }
        >
          {React.createElement(
            (RN.Platform.OS === "ios"
              ? Feather
              : MaterialCommunityIcons) as any,
            { name: "share", size: 24, color: color.textPrimary }
          )}
        </FooterButton>

        <FooterButton
          onPress={() =>
            Linking.openURL(navigationState?.url ?? route.params.url)
          }
        >
          <FontAwesome5
            name={RN.Platform.OS === "ios" ? "safari" : "chrome"}
            size={30}
            color={color.textPrimary}
          />
        </FooterButton>
      </Footer>
    </Container>
  );
}

const Container = styledMemo(RN.View, (t) => ({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: t.color.bodyBg,
}));

const ModalHeader = styledMemo(RN.View, (t) => ({
  flexDirection: "row",
  alignItems: "center",
  width: "100%",
  padding: t.space.md,
  borderBottomColor: t.color.accent,
  borderBottomWidth: t.borderWidth.hairline,
}));

const CloseButton = styledMemo(
  RN.TouchableOpacity,
  (t, p: { theme: Omit<AppThemeNames, "default"> }) => ({
    alignItems: "center",
    justifyContent: "center",
    width: 20 + t.space.sm * 2,
    height: 20 + t.space.sm * 2,
    borderRadius: t.radius.full,
    marginRight: t.space.md,
    backgroundColor:
      p.theme === "dark" ? t.color.accentLight : t.color.accentLight,
  }),
  ["theme"]
);

const Title = styledMemo(RN.Text, (t) => ({
  color: t.color.textAccent,
  fontSize: t.type.size["xs"],
  fontWeight: "700",
  flex: 1,
}));

const BrowserView = styledMemo(
  WebView,
  (_, { width }: { width: number }) => ({
    width,
    height: "100%",
  }),
  ["width"]
);

const Footer = styledMemo(RN.SafeAreaView, (t) => ({
  width: "100%",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  borderTopColor: t.color.accent,
  borderTopWidth: t.borderWidth.hairline,
}));

const FooterButton = styledMemo(RN.TouchableOpacity, (t) => ({
  padding: t.space.lg,
  paddingTop: t.space.md,
}));

export interface BrowserModalProps
  extends NativeStackScreenProps<StackParamList, "BrowserModal"> {}

type WebViewRef = {
  goBack(): void;
  goForward(): void;
  postMessage(message: string): void;
};
