import {
  Feather,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Linking from "expo-linking";
import React from "react";
import * as RN from "react-native";
import type { WebViewNavigation } from "react-native-webview";
import { WebView } from "react-native-webview";
import { Icon } from "@/components/icon";
import { responsiveSize, styles, useDash } from "@/dash";
import type { StackParamList } from "@/screens/routers";

export function BrowserModal({ navigation, route }: BrowserModalProps) {
  const {
    tokens: { color },
  } = useDash();
  const dimensions = RN.useWindowDimensions();
  const ref = React.useRef<WebView>(null);
  const [navigationState, setNavigationState] =
    React.useState<WebViewNavigation | null>(null);

  return (
    <RN.View style={container()}>
      <RN.View style={modalHeader()}>
        <RN.TouchableOpacity
          style={closeButton()}
          onPress={() => navigation.goBack()}
        >
          <Icon name="x" size={14} color="textAccent" />
        </RN.TouchableOpacity>

        <RN.Text style={title()} numberOfLines={1} ellipsizeMode="tail">
          {route.params.title || ""}
        </RN.Text>
      </RN.View>

      <WebView
        ref={ref}
        originWhitelist={["*"]}
        allowsLinkPreview
        allowsInlineMediaPlayback
        allowsBackForwardNavigationGestures
        sharedCookiesEnabled
        enableApplePay
        onNavigationStateChange={setNavigationState}
        source={{ uri: route.params.url }}
        style={browser(dimensions.width)}
      />

      <RN.SafeAreaView style={footer()}>
        <RN.TouchableOpacity
          style={footerButton()}
          onPress={() => ref.current?.goBack()}
        >
          <Feather
            name="chevron-left"
            size={responsiveSize(24)}
            color={
              navigationState?.canGoBack ? color.textPrimary : color.textAccent
            }
          />
        </RN.TouchableOpacity>

        <RN.TouchableOpacity
          style={footerButton()}
          onPress={() => ref.current?.goForward()}
        >
          <Feather
            name="chevron-right"
            size={responsiveSize(24)}
            color={
              navigationState?.canGoBack ? color.textPrimary : color.textAccent
            }
          />
        </RN.TouchableOpacity>

        <RN.TouchableOpacity
          style={footerButton()}
          onPress={() =>
            RN.Share.share({
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
        </RN.TouchableOpacity>

        <RN.TouchableOpacity
          style={footerButton()}
          onPress={() =>
            Linking.openURL(navigationState?.url ?? route.params.url)
          }
        >
          <FontAwesome5
            name={RN.Platform.OS === "ios" ? "safari" : "chrome"}
            size={responsiveSize(20)}
            color={color.textPrimary}
          />
        </RN.TouchableOpacity>
      </RN.SafeAreaView>
    </RN.View>
  );
}

const container = styles.one<RN.ViewStyle>((t) => ({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: t.color.bodyBg,
}));

const modalHeader = styles.one<RN.ViewStyle>((t) => ({
  flexDirection: "row",
  alignItems: "center",
  width: "100%",
  padding: t.space.md,
  borderBottomColor: t.color.accent,
  borderBottomWidth: t.borderWidth.hairline,
}));

const closeButton = styles.one<RN.ViewStyle>((t) => ({
  alignItems: "center",
  justifyContent: "center",
  width: 18 * (t.type.size.base / 16) + t.space.sm * 2,
  height: 18 * (t.type.size.base / 16) + t.space.sm * 2,
  borderRadius: t.radius.full,
  marginRight: t.space.md,
  backgroundColor: t.color.accentLight,
}));

const title = styles.one<RN.TextStyle>((t) => ({
  color: t.color.textAccent,
  fontSize: t.type.size["xs"],
  fontWeight: "700",
  flex: 1,
}));

const browser = styles.lazy<number, RN.ViewStyle>((width) => ({
  width,
  height: "100%",
}));

const footer = styles.one<RN.ViewStyle>((t) => ({
  width: "100%",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  borderTopColor: t.color.accent,
  borderTopWidth: t.borderWidth.hairline,
}));

const footerButton = styles.one<RN.ViewStyle>((t) => ({
  padding: t.space.lg,
  paddingTop: t.space.md,
}));

export interface BrowserModalProps
  extends NativeStackScreenProps<StackParamList, "BrowserModal"> {}
