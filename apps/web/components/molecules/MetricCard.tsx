"use client";

import { useState } from "react";
import type { MetricResult } from "@gelato/gelato-core";
import { WEB_INDICATOR_DEFINITIONS } from "../../lib/indicator-definitions";
import { Badge } from "../atoms/Badge";

const DEFAULT_METRIC: MetricResult = {
  key: "unknown",
  label: "Indicador técnico",
  value: 0,
  min: 0,
  max: 0,
  unit: "%",
  status: "warning",
  message: "Indicador pendiente de cálculo."
};

function formatMetricValue(metric: MetricResult): string {
  const safeValue = Number.isFinite(Number(metric.value)) ? Number(metric.value) : 0;
  return metric.unit === "%" ? `${safeValue}%` : `${safeValue} ${metric.unit}`;
}

function formatMetricRange(metric: MetricResult): string {
  const min = Number.isFinite(Number(metric.min)) ? Number(metric.min) : 0;
  const max = Number.isFinite(Number(metric.max)) ? Number(metric.max) : 0;
  return metric.unit === "%" ? `${min} - ${max}%` : `${min} - ${max} ${metric.unit}`;
}

export function MetricCard({ metric }: { metric?: MetricResult | null }) {
  const [open, setOpen] = useState(false);
  const safeMetric = metric ?? DEFAULT_METRIC;
  const min = Number.isFinite(Number(safeMetric.min)) ? Number(safeMetric.min) : 0;
  const max = Number.isFinite(Number(safeMetric.max)) ? Number(safeMetric.max) : 0;
  const value = Number.isFinite(Number(safeMetric.value)) ? Number(safeMetric.value) : 0;
  const range = max - min;
  const position = range <= 0 ? 100 : Math.max(0, Math.min(100, ((value - min) / range) * 100));
  const label = safeMetric.status === "ok" ? "OK" : safeMetric.status === "warning" ? "Revisar" : "Corregir";
  const help = WEB_INDICATOR_DEFINITIONS[safeMetric.key] ?? {
    title: safeMetric.label,
    shortDescription: "Indicador técnico usado para evaluar el balance de la receta.",
    whyItMatters: "Ayuda a detectar si la mezcla se comportará correctamente en textura, dulzor, dureza y vitrina.",
    correction: safeMetric.message || "Revisa la fórmula y ajusta ingredientes hasta entrar al rango objetivo."
  };

  return (
    <article className="metric">
      <div className="metricTop">
        <small>{safeMetric.label}</small>
        <div className="metricActions">
          <button className="helpButton" type="button" onClick={() => setOpen(true)} aria-label={`Ver explicación de ${safeMetric.label}`}>?</button>
          <Badge status={safeMetric.status}>{label}</Badge>
        </div>
      </div>
      <strong>{formatMetricValue(safeMetric)}</strong>
      <small>Rango: {formatMetricRange(safeMetric)}</small>
      <div className="progress"><span style={{ width: `${position}%` }} /></div>
      <small>{safeMetric.message}</small>

      {open && (
        <div className="modalBackdrop" role="dialog" aria-modal="true">
          <div className="modalCard">
            <div className="panelHeader compactHeader">
              <div>
                <h3>{help.title}</h3>
                <p className="panelText">{help.shortDescription}</p>
              </div>
              <button className="closeButton" type="button" onClick={() => setOpen(false)}>×</button>
            </div>
            <div className="infoStack">
              <div className="infoBox">
                <strong>¿Para qué sirve?</strong>
                <p>{help.whyItMatters}</p>
              </div>
              <div className="infoBox">
                <strong>Cómo corregirlo</strong>
                <p>{help.correction}</p>
              </div>
              <div className="infoBox">
                <strong>Tu lectura actual</strong>
                <p>{formatMetricValue(safeMetric)} frente al rango objetivo {formatMetricRange(safeMetric)}. {safeMetric.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
