import { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string };

export function Input({ label, ...props }: Props) {
  return (
    <div className="field">
      <label>{label}</label>
      <input className="input" {...props} />
    </div>
  );
}
