import { BalanceSummary } from "@gelato/gelato-core";
import { Badge } from "../atoms/Badge";
import { MetricCard } from "../molecules/MetricCard";

export function RecipeBalancePanel({ balance }: { balance: BalanceSummary }) {
  const statusText = balance.status === "ok" ? "Receta balanceada" : balance.status === "warning" ? "Casi balanceada" : "Fuera de balance";
  return (
    <section className="panel">
      <div className="panelHeader">
        <div>
          <h2 className="panelTitle">Indicadores técnicos</h2>
          <p className="panelText">Validación en vivo de sólidos, grasa, azúcares, PAC, POD, lactosa y neutro. Presiona ? en cualquier indicador para ver qué es y cómo corregirlo.</p>
        </div>
        <Badge status={balance.status}>{statusText}</Badge>
      </div>
      <div className="stat" style={{ marginBottom: 14 }}>
        <span>Puntaje de balance</span>
        <strong>{balance.score}/100</strong>
        <small className="muted">Costo estimado: COP ${balance.totals.costCOP.toLocaleString("es-CO")}</small>
        <small className="muted">Base: {balance.sections?.basePercent ?? 0}% · Saborizantes: {balance.sections?.flavorPercent ?? 0}%</small>
      </div>
      <div className="metricGrid">
        {balance.metrics.map((metric) => <MetricCard key={metric.key} metric={metric} />)}
      </div>
      <ul className="recommendations">
        {balance.recommendations.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>
  );
}
