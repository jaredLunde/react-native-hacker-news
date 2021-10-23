import { Feather } from "@expo/vector-icons";
import * as React from "react";
import type { AppColors } from "@/dash";
import { responsiveSize, useDash } from "@/dash";

export const Icon = React.memo(function Icon(props: IconProps) {
  const { color, type } = useDash().tokens;
  return (
    <Feather
      {...props}
      size={responsiveSize(props.size * (type.size.base / 16))}
      color={color[props.color]}
    />
  );
});

export interface IconProps extends Omit<PropsOf<typeof Feather>, "color"> {
  color: AppColors;
}
