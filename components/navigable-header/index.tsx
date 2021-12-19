import { useActionSheet } from "@expo/react-native-action-sheet";
import type { ActionSheetProps } from "@expo/react-native-action-sheet";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as React from "react";
import * as RN from "react-native";
import { Icon } from "@/components/icon";
import { styles, useDash } from "@/dash";
import type { StackParamList } from "@/screens/routers";

export function NavigableHeader({ title, actions }: NavigableHeaderProps) {
  useDash();
  const navigation = useNavigation<NativeStackNavigationProp<StackParamList>>();
  const actionSheet = useActionSheet();

  return (
    <RN.SafeAreaView style={headerContainer()}>
      <RN.View style={header()}>
        <RN.TouchableOpacity
          style={navButton("visible")}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-left" color="textAccent" size={18} />
        </RN.TouchableOpacity>

        <RN.Text style={titleStyle()} ellipsizeMode="tail">
          {title}
        </RN.Text>

        {actions ? (
          <RN.TouchableOpacity
            style={navButton("visible")}
            onPress={() => {
              actionSheet.showActionSheetWithOptions(
                actions.options,
                actions.callback
              );
            }}
          >
            <Icon name="more-horizontal" color="textAccent" size={18} />
          </RN.TouchableOpacity>
        ) : (
          <RN.View style={navButton("hidden")} />
        )}
      </RN.View>
    </RN.SafeAreaView>
  );
}

const headerContainer = styles.one<RN.ViewStyle>((t) => ({
  backgroundColor: t.color.headerBg,
}));

const header = styles.one<RN.ViewStyle>((t) => ({
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

const navButton = styles.lazy<"hidden" | "visible", RN.ViewStyle>(
  (visibilty) => (t) => ({
    alignItems: "center",
    justifyContent: "center",
    width: 18 * (t.type.size.base / 16) + t.space.sm * 2,
    height: 18 * (t.type.size.base / 16) + t.space.sm * 2,
    borderRadius: t.radius.full,
    backgroundColor: t.color.accentLight,
    opacity: visibilty === "visible" ? 1 : 0,
  })
);

const titleStyle = styles.one<RN.TextStyle>((t) => ({
  color: t.color.textAccent,
  fontSize: t.type.size.sm,
  fontWeight: "700",
  flex: 1,
  textAlign: "center",
}));

export interface NavigableHeaderProps {
  title: string;
  actions: {
    options: Parameters<ActionSheetProps["showActionSheetWithOptions"]>[0];
    callback: Parameters<ActionSheetProps["showActionSheetWithOptions"]>[1];
  };
}
