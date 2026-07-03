import { BalanceStatus } from "@gelato/gelato-core";

export function Badge({ status, children }: { status: BalanceStatus; children: React.ReactNode }) {
  return <span className={`badge ${status}`}>{children}</span>;
}
