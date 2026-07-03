import { SelectHTMLAttributes } from "react";

type Props = SelectHTMLAttributes<HTMLSelectElement> & { label: string };

export function Select({ label, children, ...props }: Props) {
  return (
    <div className="field">
      <label>{label}</label>
      <select className="select" {...props}>{children}</select>
    </div>
  );
}
