import { Feather } from "@expo/vector-icons";
import * as React from "react";
import type { AppColors } from "@/dash";
import { responsiveSize, useDash } from "@/dash";

export const Icon = React.memo(function Icon(props: IconProps) {
  const color = useDash().tokens.color;
  return (
    <Feather
      {...props}
      size={responsiveSize(props.size)}
      color={color[props.color]}
    />
  );
});

export interface IconProps extends Omit<PropsOf<typeof Feather>, "color"> {
  color: AppColors;
}
