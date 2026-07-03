"use client";

import { useMemo, useState } from "react";
import { calculateNeutralFormula, DEFAULT_INGREDIENTS, NeutralComponentInput, NeutralFormulaInput } from "@gelato/gelato-core";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";
import { Badge } from "../atoms/Badge";
import { MetricCard } from "../molecules/MetricCard";
import { NeutralComponentRow } from "../molecules/NeutralComponentRow";
import { apiPost } from "../../lib/api-client";

const dextrose = DEFAULT_INGREDIENTS.find((item) => item.id === "dextrosa")!;
const guar = DEFAULT_INGREDIENTS.find((item) => item.id === "goma-guar")!;
const cmc = DEFAULT_INGREDIENTS.find((item) => item.id === "cmc")!;
const inulina = DEFAULT_INGREDIENTS.find((item) => item.id === "inulina")!;
const emulsifier = DEFAULT_INGREDIENTS.find((item) => item.id === "mono-digliceridos")!;

export function NeutralBuilder() {
  const [neutral, setNeutral] = useState<NeutralFormulaInput>({
    name: "Neutro propio Ñam",
    targetUsagePercent: 0.5,
    components: [
      { name: dextrose.name, grams: 750, role: "carrier", composition: dextrose.composition },
      { name: inulina.name, grams: 120, role: "fiber", composition: inulina.composition },
      { name: guar.name, grams: 55, role: "stabilizer", composition: guar.composition },
      { name: cmc.name, grams: 45, role: "stabilizer", composition: cmc.composition },
      { name: emulsifier.name, grams: 30, role: "emulsifier", composition: emulsifier.composition }
    ]
  });
  const [message, setMessage] = useState("");
  const result = useMemo(() => calculateNeutralFormula(neutral), [neutral]);
  const statusText = result.status === "ok" ? "Neutro balanceado" : result.status === "warning" ? "Ajustar neutro" : "Neutro fuera de rango";

  function updateComponent(index: number, next: NeutralComponentInput) {
    setNeutral((current) => ({ ...current, components: current.components.map((item, itemIndex) => itemIndex === index ? next : item) }));
  }

  async function saveNeutral() {
    setMessage("Guardando...");
    try {
      await apiPost("/neutrals", neutral);
      setMessage("Neutro guardado en el backend.");
    } catch {
      setMessage("No se pudo guardar en API. Puedes seguir calculando localmente.");
    }
  }

  return (
    <div className="grid">
      <section className="panel">
        <div className="panelHeader">
          <div>
            <h2 className="panelTitle">Constructor de neutro propio</h2>
            <p className="panelText">Calcula la mezcla del neutro, su dosis por kg y si su composición queda dentro de rango para gelato.</p>
          </div>
          <Button onClick={saveNeutral}>Guardar neutro</Button>
        </div>
        <div className="formGrid">
          <Input label="Nombre del neutro" value={neutral.name} onChange={(event) => setNeutral({ ...neutral, name: event.target.value })} />
          <Input label="Dosis objetivo (%)" type="number" min={0.1} step={0.05} value={neutral.targetUsagePercent} onChange={(event) => setNeutral({ ...neutral, targetUsagePercent: Number(event.target.value) })} />
          <div className="stat"><span>Dosis recomendada</span><strong>{result.recommendedGramsPerKg} g/kg</strong></div>
        </div>

        <div className="actions" style={{ marginBottom: 14 }}>
          <Button onClick={() => setNeutral({ ...neutral, components: [...neutral.components, { name: dextrose.name, grams: 0, role: "carrier", composition: dextrose.composition }] })}>Agregar componente</Button>
          <span className="muted">Lote del neutro: {result.totalWeightGrams.toFixed(1)} g</span>
        </div>
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Componente</th>
                <th>Gramos</th>
                <th>Rol</th>
                <th>Usar composición</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {neutral.components.map((component, index) => (
                <NeutralComponentRow
                  key={`${component.name}-${index}`}
                  component={component}
                  onChange={(next) => updateComponent(index, next)}
                  onRemove={() => setNeutral({ ...neutral, components: neutral.components.filter((_, itemIndex) => itemIndex !== index) })}
                />
              ))}
            </tbody>
          </table>
        </div>
        <p className="footerNote">{message || "Cuando el neutro esté balanceado, agrégalo a la receta como ingrediente neutro propio con su composición calculada."}</p>
      </section>

      <section className="panel">
        <div className="panelHeader">
          <div>
            <h2 className="panelTitle">Balance del neutro</h2>
            <p className="panelText">Controla portador, humedad, estabilizante activo y dosis.</p>
          </div>
          <Badge status={result.status}>{statusText}</Badge>
        </div>
        <div className="stat" style={{ marginBottom: 14 }}>
          <span>Puntaje del neutro</span>
          <strong>{result.score}/100</strong>
          <small className="muted">Costo estimado: COP ${(result.composition.costCOPPerKg ?? 0).toLocaleString("es-CO")}/kg</small>
        </div>
        <div className="metricGrid">
          {result.metrics.map((metric) => <MetricCard key={metric.key} metric={metric} />)}
        </div>
        <ul className="recommendations">
          {result.recommendations.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
    </div>
  );
}
