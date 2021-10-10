import type { NavigationProp } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import * as RN from "react-native";
import logo from "@/assets/logo.png";
import { Icon } from "@/components/icon";
import { oneMemo, styles, useDash } from "@/dash";
import type { HomeStackParamList } from "@/screens/routers";

export function Header() {
  useDash();
  const navigation = useNavigation<NavigationProp<HomeStackParamList>>();
  const { routes, index } = navigation.getState();
  const route = routes[index];
  const date = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  let content = (
    <RN.View>
      <RN.TouchableWithoutFeedback
        onPress={() => navigation.navigate("Stories", (route as any).params)}
      >
        <RN.View style={logoContainer()}>
          <RN.Image style={logoMark()} source={logo} />
          <RN.Text style={logoType()}>
            {!("filter" in route.params)
              ? "HN"
              : route.params.filter === "show"
              ? "Show HN"
              : route.params.filter === "ask"
              ? "Ask HN"
              : route.params.filter === "job"
              ? "Jobs"
              : "HN"}
          </RN.Text>
        </RN.View>
      </RN.TouchableWithoutFeedback>

      <RN.Text style={currentDate()}>{date}</RN.Text>
    </RN.View>
  );

  if (route.name === "User" && route.params && "id" in route.params) {
    content = (
      <React.Fragment>
        <RN.TouchableOpacity
          style={backButton()}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-left" color="textAccent" size={18} />
        </RN.TouchableOpacity>

        <RN.Text style={username()} ellipsizeMode="tail">
          {route.params.id}
        </RN.Text>

        <RN.TouchableOpacity style={backButton()}>
          <Icon name="more-horizontal" color="textAccent" size={18} />
        </RN.TouchableOpacity>
      </React.Fragment>
    );
  }

  return (
    <RN.SafeAreaView style={headerContainer()}>
      <RN.View style={header()}>{content}</RN.View>
    </RN.SafeAreaView>
  );
}

const headerContainer = oneMemo<RN.ViewStyle>((t) => ({
  backgroundColor: t.color.headerBg,
}));

const header = oneMemo<RN.ViewStyle>((t) => ({
  flexDirection: "row",
  width: "100%",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: t.color.headerBg,
  paddingTop: t.space.md,
  paddingBottom: t.space.md,
  paddingRight: t.space.lg,
  paddingLeft: t.space.lg,
  borderBottomWidth: t.borderWidth.hairline,
  borderBottomColor: t.color.accent,
}));

const backButton = oneMemo<RN.ViewStyle>((t) => ({
  alignItems: "center",
  justifyContent: "center",
  width: 18 + t.space.sm * 2,
  height: 18 + t.space.sm * 2,
  borderRadius: t.radius.full,
  backgroundColor: t.color.accentLight,
}));

const username = oneMemo<RN.TextStyle>((t) => ({
  color: t.color.textAccent,
  fontSize: t.type.size["xs"],
  fontWeight: "700",
  flex: 1,
  textAlign: "center",
}));

const logoContainer = styles.one<RN.ViewStyle>({
  flexDirection: "row",
  flexWrap: "nowrap",
  alignItems: "center",
  justifyContent: "flex-start",
  width: "100%",
});

const logoMark = oneMemo<RN.ImageStyle>((t) => ({
  width: t.type.size.lg,
  height: t.type.size.lg,
  borderRadius: t.radius.md,
  marginRight: t.space.md,
}));

const logoType = oneMemo<RN.TextStyle>((t) => ({
  fontSize: t.type.size.lg,
  color: t.color.textPrimary,
  fontWeight: "900",
}));

const currentDate = oneMemo<RN.ViewStyle>((t) => ({
  backgroundColor: t.color.headerBg,
  fontSize: t.type.size["lg"],
  lineHeight: t.type.size["lg"],
  fontWeight: "900",
  color: t.color.textAccent,
}));
