import { registerRootComponent } from "expo";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { SafeAreaView, Text, View } from "react-native";
import { DashProvider, styled } from "@/dash";

registerRootComponent(App);

function App() {
  return (
    <DashProvider>
      <StyledSafeAreaView>
        <StyledText>Hacker news</StyledText>

        <StyledView
          style={(t) => ({
            margin: 60,
            width: 200,
            height: 100,
            borderRadius: t.radius["xl"],
            backgroundColor: t.color.white,
            ...t.shadow["md"],
          })}
        />
        <StatusBar style="auto" />
      </StyledSafeAreaView>
    </DashProvider>
  );
}

const StyledSafeAreaView = styled(SafeAreaView, (t) => ({
  flex: 1,
  backgroundColor: t.color.bodyBg,
}));
const StyledView = styled(View);

const StyledText = styled(Text, (t) => ({
  color: t.color.primaryText,
  fontSize: t.type.size["4xl"],
  fontWeight: "900",
  letterSpacing: t.type.tracking.tighter,
}));
