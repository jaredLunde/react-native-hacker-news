import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as React from "react";
import * as RN from "react-native";
import logo from "@/assets/logo.png";
import { Icon } from "@/components/icon";
import { oneMemo, styles, useDash } from "@/dash";
import type { StackParamList } from "@/screens/routers";

export function LogoHeader({ title }: LogoHeaderProps) {
  useDash();
  const navigation = useNavigation<NativeStackNavigationProp<StackParamList>>();
  const date = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <RN.SafeAreaView style={headerContainer()}>
      <RN.View style={header()}>
        <RN.View>
          <RN.TouchableWithoutFeedback>
            <RN.View style={logoContainer()}>
              <RN.Image style={logoMark()} source={logo} />
              <RN.Text style={logoType()}>{title}</RN.Text>
            </RN.View>
          </RN.TouchableWithoutFeedback>
          <RN.Text style={currentDate()}>{date}</RN.Text>
        </RN.View>
        <RN.TouchableWithoutFeedback
          onPress={() => navigation.push("Preferences", {})}
        >
          <Icon name="settings" color="textAccent" size={18} />
        </RN.TouchableWithoutFeedback>
      </RN.View>
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
  lineHeight: t.type.size["lg"] * 1.15,
  fontWeight: "900",
  color: t.color.textAccent,
}));

export interface LogoHeaderProps {
  title: string;
}
