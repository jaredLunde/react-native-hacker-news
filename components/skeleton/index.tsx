import * as React from "react";
import * as RN from "react-native";
import { styled } from "@/dash";

export function Skeleton(props: SkeletonProps) {
  const [fadeAnim] = React.useState(() => new RN.Animated.Value(0));

  React.useLayoutEffect(() => {
    const animation = RN.Animated.loop(
      RN.Animated.sequence([
        RN.Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
        RN.Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
  }, [fadeAnim]);

  return (
    <StyledSkeleton {...props} style={[props.style, { opacity: fadeAnim }]} />
  );
}

const StyledSkeleton = styled(
  RN.Animated.View,
  (t, { variant = "rect" }: { variant?: SkeletonVariant }) => {
    return {
      backgroundColor: t.color.accent,
      height: variant === "text" ? t.type.size.sm : undefined,
      borderRadius: variant === "circle" ? t.radius.full : t.radius.secondary,
    };
  }
);

export interface SkeletonProps extends PropsOf<typeof StyledSkeleton> {}

export type SkeletonVariant = "text" | "rect" | "circle";
