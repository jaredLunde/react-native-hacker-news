import {
  Feather,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Linking from "expo-linking";
import React from "react";
import * as RN from "react-native";
import { Share, useWindowDimensions } from "react-native";
import type { WebViewNavigation } from "react-native-webview";
import { WebView } from "react-native-webview";
import { Icon } from "@/components/icon";
import { responsiveSize, styledMemo, useDash } from "@/dash";
import type { StackParamList } from "@/screens/routers";

export function BrowserModal({ navigation, route }: BrowserModalProps) {
  const {
    tokens: { color },
  } = useDash();
  const dimensions = useWindowDimensions();
  const ref = React.useRef<WebViewRef>(null);
  const [navigationState, setNavigationState] =
    React.useState<WebViewNavigation | null>(null);

  return (
    <Container>
      <ModalHeader>
        <CloseButton onPress={() => navigation.goBack()}>
          <Icon name="x" size={20} color="textAccent" />
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
          <Icon
            name="chevron-left"
            size={24}
            color={navigationState?.canGoBack ? "textPrimary" : "textAccent"}
          />
        </FooterButton>

        <FooterButton onPress={() => ref.current?.goForward()}>
          <Icon
            name="chevron-right"
            size={24}
            color={navigationState?.canGoBack ? "textPrimary" : "textAccent"}
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
            {
              name: "share",
              size: responsiveSize(20),
              color: color.textPrimary,
            }
          )}
        </FooterButton>

        <FooterButton
          onPress={() =>
            Linking.openURL(navigationState?.url ?? route.params.url)
          }
        >
          <FontAwesome5
            name={RN.Platform.OS === "ios" ? "safari" : "chrome"}
            size={responsiveSize(20)}
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

const CloseButton = styledMemo(RN.TouchableOpacity, (t) => ({
  alignItems: "center",
  justifyContent: "center",
  width: 20 + t.space.sm * 2,
  height: 20 + t.space.sm * 2,
  borderRadius: t.radius.full,
  marginRight: t.space.md,
  backgroundColor: t.color.accentLight,
}));

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
