import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as React from "react";
import * as RN from "react-native";
import { Icon } from "@/components/icon";
import { oneMemo, useDash } from "@/dash";
import type { StackParamList } from "@/screens/routers";

export function NavigableHeader({ title }: NavigableHeaderProps) {
  useDash();
  const navigation = useNavigation<NativeStackNavigationProp<StackParamList>>();

  return (
    <RN.SafeAreaView style={headerContainer()}>
      <RN.View style={header()}>
        <RN.TouchableOpacity
          style={backButton()}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-left" color="textAccent" size={18} />
        </RN.TouchableOpacity>

        <RN.Text style={titleStyle()} ellipsizeMode="tail">
          {title}
        </RN.Text>

        <RN.TouchableOpacity style={backButton()}>
          <Icon name="more-horizontal" color="textAccent" size={18} />
        </RN.TouchableOpacity>
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

const backButton = oneMemo<RN.ViewStyle>((t) => ({
  alignItems: "center",
  justifyContent: "center",
  width: 18 + t.space.sm * 2,
  height: 18 + t.space.sm * 2,
  borderRadius: t.radius.full,
  backgroundColor: t.color.accentLight,
}));

const titleStyle = oneMemo<RN.TextStyle>((t) => ({
  color: t.color.textAccent,
  fontSize: t.type.size["xs"],
  fontWeight: "700",
  flex: 1,
  textAlign: "center",
}));

export interface NavigableHeaderProps {
  title: string;
}
