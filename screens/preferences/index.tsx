import { useAsync } from "@react-hook/async";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Application from "expo-application";
import * as React from "react";
import * as RN from "react-native";
import type { ValueOf } from "type-fest";
import { NavigableHeader } from "@/components/navigable-header";
import {
  colorSystem,
  createTypeSystem,
  lazyMemo,
  oneMemo,
  useDash,
} from "@/dash";
import type { StackParamList } from "@/screens/routers";

export function Preferences(props: PreferencesProps) {
  const { insertThemes, insertTokens } = useDash();
  const [preferences, loadPreferences] = usePreferences();
  const dimensions = RN.useWindowDimensions();

  const [, setStorage] = useAsync(async (items: PreferencesType) => {
    const data = Object.entries({
      data: items,
      version: preferencesVersion,
    }).map(([key, value]) => [key, JSON.stringify(value)]);
    await AsyncStorage.multiSet(data);
    await loadPreferences();
  });

  React.useLayoutEffect(() => {
    if (
      preferences.status === "success" &&
      preferences.data &&
      !Object.values(preferences.data).length
    ) {
      setStorage(defaultPreferences);
    }
  }, [preferences, setStorage]);

  console.log("Current preferences:", preferences.data);
  return (
    <RN.SafeAreaView style={container()}>
      <NavigableHeader title="Preferences" />
      <RN.ScrollView>
        <RN.Text style={preferenceGroupTitle()}>Primary color</RN.Text>
        <RN.View style={preferenceGroup()}>
          <RN.View style={colorSwatches()}>
            {primaryColors.map((color) => (
              <RN.TouchableOpacity
                key={color}
                onPress={() => {
                  insertThemes({
                    dark: { color: { primary: colorSystem[color] } },
                    light: { color: { primary: colorSystem[color] } },
                  });
                  setStorage({
                    ...defaultPreferences,
                    ...preferences?.data,
                    primaryColor: color,
                  });
                }}
              >
                <RN.View
                  style={colorSwatch({
                    color,
                    size: (dimensions.width - 112) / 4,
                    selected: color === preferences.data?.primaryColor,
                  })}
                />
              </RN.TouchableOpacity>
            ))}
          </RN.View>
        </RN.View>

        <RN.Text style={preferenceGroupTitle()}>Text size</RN.Text>
        <RN.View style={preferenceGroup()}>
          <Slider
            style={slider()}
            minimumValue={12}
            maximumValue={20}
            step={2}
            value={preferences.data?.baseTypeSize ?? 16}
            onValueChange={(value) => {
              insertTokens({
                type: createTypeSystem(value),
              });

              setStorage({
                ...defaultPreferences,
                ...preferences?.data,
                baseTypeSize: value,
              });
            }}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
          />
        </RN.View>

        <RN.Text style={version()}>{Application.nativeBuildVersion}</RN.Text>
      </RN.ScrollView>
    </RN.SafeAreaView>
  );
}

export function usePreferences() {
  const [storage, loadStorage] = useAsync(async () => {
    const keys = await AsyncStorage.getAllKeys();
    const values = await AsyncStorage.multiGet(keys);
    const data: Record<string, unknown> = {};

    for (const [key, value] of values) {
      data[key] = value && JSON.parse(value);
    }

    return data as { data: PreferencesType; version: string };
  });

  React.useEffect(() => {
    loadStorage();
  }, []);

  return React.useMemo(() => {
    const { value, ...rest } = storage;
    return [
      { ...rest, data: value?.data, version: value?.version },
      loadStorage,
    ] as const;
  }, [storage, loadStorage]);
}

const preferencesVersion = "1.0";
const defaultPreferences: PreferencesType = {
  colorScheme: RN.Appearance.getColorScheme(),
  primaryColor: "orange500",
  baseTypeSize: 16,
};
const primaryColors: (keyof typeof colorSystem)[] = [
  "orange500",
  "amber500",
  "emerald500",
  "blue500",
  "cyan500",
  "teal500",
  "green500",
  "lime600",
  "red600",
  "lightBlue500",
  "violet500",
  "purple500",
  "indigo500",
  "fuchsia500",
  "pink500",
  "rose500",
];

export type PreferencesType = {
  colorScheme: "dark" | "light" | null | undefined;
  primaryColor: ValueOf<typeof primaryColors>;
  baseTypeSize: number;
};

const container = oneMemo<RN.ViewStyle>((t) => ({
  backgroundColor: t.color.bodyBg,
  height: "100%",
  width: "100%",
}));

const slider = oneMemo<RN.ViewStyle>((t) => ({ width: "100%", height: 40 }));

const preferenceGroup = oneMemo<RN.ViewStyle>((t) => ({
  backgroundColor: t.color.accentLight,
  padding: t.space.lg,
  margin: t.space.lg,
  marginTop: 0,
  borderRadius: t.radius.xl,
}));

const preferenceGroupTitle = oneMemo<RN.TextStyle>((t) => ({
  color: t.color.textPrimary,
  fontSize: t.type.size["2xl"],
  fontWeight: "900",
  padding: t.space.lg,
  marginTop: t.space.lg,
}));

const preferenceGroupSubtitle = oneMemo<RN.TextStyle>((t) => ({
  color: t.color.textPrimary,
  fontSize: t.type.size.base,
  fontWeight: "700",
  marginBottom: t.space.lg,
}));

const colorSwatches = oneMemo<RN.ViewStyle>(() => ({
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
}));

const colorSwatch = lazyMemo<
  { color: string; size: number; selected: boolean },
  RN.ViewStyle
>(({ color, size, selected }) => (t) => ({
  width: size,
  height: size,
  marginBottom: t.space.md,
  backgroundColor: (t.color as any)[color],
  borderColor: selected ? t.color.textPrimary : "transparent",
  borderWidth: 6,
  borderRadius: t.radius.primary,
}));

const version = oneMemo<RN.TextStyle>((t) => ({
  color: t.color.textAccent,
  textAlign: "center",
}));

export interface PreferencesProps
  extends NativeStackScreenProps<StackParamList, "User"> {}
