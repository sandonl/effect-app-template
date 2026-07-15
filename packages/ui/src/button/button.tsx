import { Button as BaseButton } from "@base-ui/react/button";
import type { ComponentProps } from "react";
import styles from "./button.module.css";

export type ButtonProps = ComponentProps<typeof BaseButton>;

export function Button({ className, ...props }: ButtonProps) {
  const classes = [styles.root, className].filter(Boolean).join(" ");

  return <BaseButton className={classes} {...props} />;
}
