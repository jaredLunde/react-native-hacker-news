import * as React from "react";
import * as RN from "react-native";
import { styles, useDash } from "@/dash";

export function Skeleton(props: SkeletonProps) {
  useDash();
  const [fadeAnim] = React.useState(() => new RN.Animated.Value(0));

  React.useLayoutEffect(() => {
    const animation = RN.Animated.loop(
      RN.Animated.sequence([
        RN.Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 670,
          useNativeDriver: true,
        }),
        RN.Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 670,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
  }, [fadeAnim]);

  return (
    <RN.Animated.View
      {...props}
      style={[
        skeleton(props.variant ?? "rect"),
        props.style,
        { opacity: fadeAnim },
      ]}
    />
  );
}

const skeleton = styles.lazy<SkeletonVariant, RN.ViewStyle>(
  (variant = "rect") =>
    (t) => ({
      backgroundColor: t.color.accent,
      height: variant === "text" ? t.type.size.sm : undefined,
      borderRadius: variant === "circle" ? t.radius.full : t.radius.secondary,
    })
);

export interface SkeletonProps extends PropsOf<typeof RN.Animated.View> {
  /**
   * Variant of the skeleton.
   *
   * @default "rect"
   */
  variant?: SkeletonVariant;
}

export type SkeletonVariant = "text" | "rect" | "circle";
