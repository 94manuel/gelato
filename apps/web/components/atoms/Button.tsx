import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" };

export function Button({ variant = "primary", className = "", ...props }: Props) {
  const variantClass = variant === "primary" ? "" : variant;
  return <button className={`button ${variantClass} ${className}`} {...props} />;
}
