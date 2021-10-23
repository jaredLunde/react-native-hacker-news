import { useAsync } from "@react-hook/async";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Application from "expo-application";
import * as React from "react";
import * as RN from "react-native";
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
  const { tokens } = useDash();
  const [baseTypeSize, setBaseTypeSize] = React.useState<number | undefined>(
    undefined
  );
  const [preferences, loadPreferences] = usePreferences();
  const colorScheme = RN.useColorScheme();
  const dimensions = RN.useWindowDimensions();

  const [, setStorage_] = useAsync(async (preferences: PreferencesType) => {
    const data = Object.entries({
      data: preferences,
      version: preferencesVersion,
    }).map(([key, value]) => [key, JSON.stringify(value)]);
    await AsyncStorage.multiSet(data);
    await loadPreferences();
  });

  const setStorage = React.useCallback(
    (settings: Partial<PreferencesType>) => {
      setStorage_({ ...defaultPreferences, ...preferences?.data, ...settings });
    },
    [setStorage_, preferences?.data]
  );

  React.useLayoutEffect(() => {
    if (
      preferences.status === "success" &&
      preferences.data &&
      !Object.values(preferences.data).length
    ) {
      setStorage(defaultPreferences);
    }
  }, [preferences, setStorage]);

  React.useLayoutEffect(() => {
    if (baseTypeSize) {
      setStorage({
        baseTypeSize,
      });
    }
  }, [baseTypeSize]);

  return (
    <RN.SafeAreaView style={container()}>
      <NavigableHeader
        title="Preferences"
        actions={{
          options: {
            options: ["Restore default settings", "Cancel"],
          },
          callback(index) {
            switch (index) {
              case 0:
                setStorage(defaultPreferences);
                break;
            }
          },
        }}
      />
      <RN.ScrollView style={preferencesContainer()}>
        <RN.View style={preferenceGroup()}>
          <RN.View style={preferenceLabelContainer()}>
            <RN.Text style={preferenceLabel()}>Color</RN.Text>
            <RN.Text style={preferenceDescription()}>
              Sets the primary color used throughout the app
            </RN.Text>
          </RN.View>
          <RN.View style={colorSwatches()}>
            {primaryColors.map((color) => (
              <RN.TouchableOpacity
                key={color}
                onPress={() => {
                  setStorage({
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

        <RN.View style={preferenceGroup()}>
          <RN.View style={preferenceRow("center")}>
            <RN.View style={preferenceLabelContainer()}>
              <RN.Text style={preferenceLabel()}>Text size</RN.Text>
            </RN.View>
            <RN.View style={sliderContainer}>
              <Slider
                style={slider}
                minimumValue={12}
                maximumValue={20}
                step={2}
                value={baseTypeSize ?? preferences.data?.baseTypeSize ?? 16}
                onValueChange={setBaseTypeSize}
                minimumTrackTintColor="#FFFFFF"
                maximumTrackTintColor="#000000"
              />
            </RN.View>
          </RN.View>
        </RN.View>

        <RN.View style={preferenceGroup()}>
          <RN.View style={preferenceRow("start")}>
            <RN.View style={preferenceLabelContainer()}>
              <RN.Text style={preferenceLabel()}>Dark mode</RN.Text>
              <RN.Text style={preferenceDescription()}>
                By default we use your system preferences{" "}
                {preferences.data?.colorScheme && (
                  <RN.Text
                    style={resetToDefault()}
                    onPress={() => setStorage({ colorScheme: undefined })}
                  >
                    Reset
                  </RN.Text>
                )}
              </RN.Text>
            </RN.View>
            <RN.Switch
              value={
                preferences.data?.colorScheme === "dark" ||
                (preferences.data?.colorScheme === undefined &&
                  colorScheme === "dark")
              }
              trackColor={{
                false: tokens.color.textAccent,
                true: tokens.color.primary,
              }}
              onValueChange={(value) => {
                setStorage({
                  colorScheme: value ? "dark" : "light",
                });
              }}
            />
          </RN.View>
        </RN.View>

        <RN.Text style={version()}>v{Application.nativeBuildVersion}</RN.Text>
      </RN.ScrollView>
    </RN.SafeAreaView>
  );
}

export function usePreferences() {
  const { setTheme, insertThemes, insertTokens } = useDash();
  const colorScheme = RN.useColorScheme();
  const [storage, loadStorage] = useAsync(async () => {
    const keys = await AsyncStorage.getAllKeys();
    const values = await AsyncStorage.multiGet(keys);
    const data: Record<string, unknown> = {
      data: defaultPreferences,
      version: preferencesVersion,
    };

    for (const [key, value] of values) {
      data[key] = value && JSON.parse(value);
    }

    return data as { data: PreferencesType; version: string };
  });

  React.useLayoutEffect(() => {
    loadStorage();
  }, []);

  React.useLayoutEffect(() => {
    const theme = storage.value?.data.colorScheme ?? colorScheme;
    if (theme) {
      setTheme(theme);
    }
  }, [storage.value?.data.colorScheme, colorScheme]);

  React.useLayoutEffect(() => {
    const baseTypeSize = storage.value?.data.baseTypeSize;
    if (baseTypeSize) {
      insertTokens({
        type: createTypeSystem(baseTypeSize),
      });
    }
  }, [storage.value?.data.baseTypeSize]);

  React.useLayoutEffect(() => {
    const primaryColor = storage.value?.data.primaryColor;
    if (primaryColor) {
      insertThemes({
        dark: { color: { primary: colorSystem[primaryColor] } },
        light: { color: { primary: colorSystem[primaryColor] } },
      });
    }
  }, [storage.value?.data.primaryColor]);

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
  colorScheme: undefined,
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
  primaryColor: keyof typeof colorSystem;
  baseTypeSize: number;
};

const container = oneMemo<RN.ViewStyle>((t) => ({
  backgroundColor: t.color.bodyBg,
  height: "100%",
  width: "100%",
}));

const preferencesContainer = oneMemo<RN.ViewStyle>((t) => ({
  paddingTop: t.space.lg,
  width: "100%",
}));

const slider: RN.ViewStyle = { width: "100%", height: 40 };
const sliderContainer: RN.ViewStyle = {
  width: "100%",
  flexGrow: 1,
  flexShrink: 1,
};

const preferenceGroup = oneMemo<RN.ViewStyle>((t) => ({
  backgroundColor: t.color.accentLight,
  padding: t.space.lg,
  margin: t.space.lg,
  marginTop: 0,
  borderRadius: t.radius.xl,
}));

const preferenceLabel = oneMemo<RN.TextStyle>((t) => ({
  color: t.color.textPrimary,
  fontSize: t.type.size.base,
  fontWeight: "700",
  width: "100%",
}));

const preferenceDescription = oneMemo<RN.TextStyle>((t) => ({
  color: t.color.textAccent,
  fontSize: t.type.size.xs,
  fontWeight: "400",
  width: "100%",
  marginTop: t.space.sm,
}));

const preferenceRow = lazyMemo<"center" | "start", RN.ViewStyle>(
  (variant) => () => ({
    flexDirection: "row",
    alignItems: variant === "center" ? "center" : "flex-start",
  })
);

const preferenceLabelContainer = oneMemo<RN.ViewStyle>((t) => ({
  flexDirection: "column",
  flexGrow: 1,
  flexShrink: 1,
  flexWrap: "wrap",
  minWidth: 128,
  marginRight: t.space.lg,
}));

const colorSwatches = oneMemo<RN.ViewStyle>((t) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
  marginTop: t.space.lg,
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

const resetToDefault = oneMemo<RN.TextStyle>((t) => ({
  color: t.color.primary,
  fontWeight: "500",
}));

const version = oneMemo<RN.TextStyle>((t) => ({
  color: t.color.textAccent,
  textAlign: "center",
  marginBottom: t.space["2xl"],
}));

export interface PreferencesProps
  extends NativeStackScreenProps<StackParamList, "User"> {}
