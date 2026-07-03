"use client";

import { useEffect, useMemo, useState } from "react";
import { BalanceStatus, calculateRecipeBalance, RecipeInput, SavedRecipe } from "@gelato/gelato-core";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";
import { Badge } from "../atoms/Badge";
import { apiGet, apiPost } from "../../lib/api-client";
import { formatCOP } from "../../lib/procurement";
import { getWebRecipeTypeLabel } from "../../lib/recipe-types";

interface RecipeNoteView {
  id: string;
  recipeId: string;
  comment: string;
  rating: number;
  author?: string | null;
  createdAt?: string | Date;
}

interface RecipeHistoryView {
  id: string;
  recipeId: string;
  action: string;
  versionNumber: number;
  summary: string;
  snapshot?: unknown;
  rating?: number | null;
  author?: string | null;
  createdAt?: string | Date;
}

interface RecipeTimelineView {
  recipe: SavedRecipe;
  notes: RecipeNoteView[];
  history: RecipeHistoryView[];
}

interface RecipeVersionView {
  versionNumber: number;
  entry: RecipeHistoryView;
  recipe: SavedRecipe;
}

interface Props {
  recipeId?: string | null;
  refreshToken?: number;
  onChanged?: () => void;
  onVersionRestored?: (recipe: SavedRecipe) => void;
}

function formatDate(value?: string | Date | null) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return date.toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

function ratingLabel(value?: number | null) {
  return `${Number(value ?? 0).toFixed(2)}/5`;
}

function actionLabel(action: string) {
  const labels: Record<string, string> = {
    CREATED: "Creación",
    UPDATED: "Cambio de fórmula",
    NOTE_ADDED: "Nota de ensayo",
    PRODUCTION_APPROVED: "Aprobación producción",
    VERSION_RESTORED: "Restauración de versión",
    PRODUCTION_APPROVED_VERSION: "Aprobación versión histórica"
  };
  return labels[action] ?? action;
}

function isRecipeSnapshot(value: unknown): value is SavedRecipe {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<SavedRecipe>;
  return typeof candidate.name === "string" && typeof candidate.type === "string" && Array.isArray(candidate.ingredients);
}

function snapshotToSavedRecipe(snapshot: SavedRecipe, fallbackId: string): SavedRecipe {
  return {
    ...snapshot,
    id: snapshot.id || fallbackId,
    targetWeightGrams: Number(snapshot.targetWeightGrams || 1000),
    ingredients: snapshot.ingredients || [],
    balance: snapshot.balance || calculateRecipeBalance(snapshot as RecipeInput)
  };
}

function buildRecipeVersions(timeline: RecipeTimelineView | null): RecipeVersionView[] {
  if (!timeline) return [];
  const versions = new Map<number, RecipeVersionView>();

  [...timeline.history]
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
    .forEach((entry) => {
      if (!isRecipeSnapshot(entry.snapshot)) return;
      if (versions.has(entry.versionNumber)) return;
      versions.set(entry.versionNumber, {
        versionNumber: entry.versionNumber,
        entry,
        recipe: snapshotToSavedRecipe(entry.snapshot, timeline.recipe.id)
      });
    });

  if (!versions.has(timeline.recipe.versionNumber ?? 1)) {
    versions.set(timeline.recipe.versionNumber ?? 1, {
      versionNumber: timeline.recipe.versionNumber ?? 1,
      entry: {
        id: `current-${timeline.recipe.id}`,
        recipeId: timeline.recipe.id,
        action: "CURRENT",
        versionNumber: timeline.recipe.versionNumber ?? 1,
        summary: "Versión actual de trabajo.",
        snapshot: timeline.recipe,
        createdAt: timeline.recipe.updatedAt
      },
      recipe: timeline.recipe
    });
  }

  return [...versions.values()].sort((a, b) => b.versionNumber - a.versionNumber);
}

export function RecipeExperimentPanel({ recipeId, refreshToken = 0, onChanged, onVersionRestored }: Props) {
  const [timeline, setTimeline] = useState<RecipeTimelineView | null>(null);
  const [rating, setRating] = useState(4.5);
  const [author, setAuthor] = useState("Gelato Lab");
  const [comment, setComment] = useState("");
  const [approvalNotes, setApprovalNotes] = useState("");
  const [versionNotes, setVersionNotes] = useState("");
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setTimeline(null);
    setSelectedVersion(null);
    setMessage("");
  }, [recipeId]);

  async function loadTimeline() {
    if (!recipeId) return;
    setMessage("Cargando historial de ensayos...");
    try {
      const data = await apiGet<RecipeTimelineView>(`/recipes/${recipeId}/timeline`);
      setTimeline(data);
      setSelectedVersion((current) => current ?? data.recipe.versionNumber ?? 1);
      setMessage("");
    } catch (error) {
      setMessage("No se pudo cargar el historial de esta receta.");
    }
  }

  useEffect(() => { void loadTimeline(); }, [recipeId, refreshToken]);

  const versions = useMemo(() => buildRecipeVersions(timeline), [timeline]);
  const selectedVersionView = useMemo(() => {
    if (versions.length === 0) return null;
    return versions.find((item) => item.versionNumber === selectedVersion) ?? versions[0];
  }, [versions, selectedVersion]);

  const bestNote = useMemo(() => {
    const notes = timeline?.notes ?? [];
    return [...notes].sort((a, b) => b.rating - a.rating)[0];
  }, [timeline]);

  async function addNote() {
    if (!recipeId) return;
    if (!comment.trim()) {
      setMessage("Escribe una nota del ensayo antes de guardar.");
      return;
    }
    const safeRating = Math.max(1, Math.min(5, Number(rating || 1)));
    setMessage("Guardando nota y creando registro en historial...");
    try {
      const data = await apiPost<RecipeTimelineView>(`/recipes/${recipeId}/notes`, {
        comment: comment.trim(),
        rating: Math.round(safeRating * 100) / 100,
        author: author.trim() || undefined
      });
      setTimeline(data);
      setSelectedVersion(data.recipe.versionNumber ?? selectedVersion);
      setComment("");
      setMessage("Nota guardada. El historial de la receta fue actualizado.");
      onChanged?.();
    } catch (error) {
      setMessage("No se pudo guardar la nota.");
    }
  }

  async function approveProduction() {
    if (!recipeId) return;
    setMessage("Aprobando receta actual para producción...");
    try {
      const data = await apiPost<RecipeTimelineView>(`/recipes/${recipeId}/approve-production`, {
        approvedBy: author.trim() || "Gelato Lab",
        notes: approvalNotes.trim() || undefined
      });
      setTimeline(data);
      setSelectedVersion(data.recipe.productionApprovedVersion ?? data.recipe.versionNumber ?? selectedVersion);
      setApprovalNotes("");
      setMessage("Receta aprobada. Ya aparece en la sección Producción.");
      onChanged?.();
    } catch (error) {
      setMessage("No se pudo aprobar la receta para producción.");
    }
  }

  async function restoreVersion(versionNumber: number) {
    if (!recipeId) return;
    setMessage(`Restaurando v${versionNumber} como nueva versión actual...`);
    try {
      const data = await apiPost<RecipeTimelineView>(`/recipes/${recipeId}/versions/${versionNumber}/restore`, {
        restoredBy: author.trim() || "Gelato Lab",
        notes: versionNotes.trim() || undefined
      });
      setTimeline(data);
      setSelectedVersion(data.recipe.versionNumber ?? null);
      setVersionNotes("");
      onVersionRestored?.(data.recipe);
      onChanged?.();
      setMessage(`Versión v${versionNumber} restaurada como nueva v${data.recipe.versionNumber}.`);
    } catch (error) {
      setMessage(`No se pudo restaurar la versión v${versionNumber}.`);
    }
  }

  async function approveVersionForProduction(versionNumber: number) {
    if (!recipeId) return;
    setMessage(`Aprobando v${versionNumber} para producción...`);
    try {
      const data = await apiPost<RecipeTimelineView>(`/recipes/${recipeId}/versions/${versionNumber}/approve-production`, {
        approvedBy: author.trim() || "Gelato Lab",
        notes: approvalNotes.trim() || versionNotes.trim() || undefined
      });
      setTimeline(data);
      setSelectedVersion(versionNumber);
      setApprovalNotes("");
      setVersionNotes("");
      onChanged?.();
      setMessage(`La versión v${versionNumber} quedó como fórmula oficial de producción.`);
    } catch (error) {
      setMessage(`No se pudo aprobar la versión v${versionNumber}.`);
    }
  }

  function renderSelectedVersion() {
    if (!selectedVersionView) return null;
    const recipe = selectedVersionView.recipe;
    const balance = calculateRecipeBalance(recipe);
    const base = balance.scaledIngredients.filter((item) => item.section !== "flavor");
    const flavor = balance.scaledIngredients.filter((item) => item.section === "flavor");

    return (
      <div className="versionPreview">
        <div className="sectionHeader">
          <div>
            <h4>Detalle de v{selectedVersionView.versionNumber}</h4>
            <p className="panelText">{recipe.name} · {getWebRecipeTypeLabel(recipe.type)} · {recipe.targetWeightGrams.toLocaleString("es-CO")} g · {balance.score}/100 balance</p>
          </div>
          <div className="scorePill">Costo {formatCOP(balance.totals.costCOP)}</div>
        </div>
        <div className="productionTables">
          <div className="tableWrap compactTable">
            <table>
              <thead><tr><th>Base requerida</th><th>g</th><th>%</th></tr></thead>
              <tbody>
                {base.map((item, index) => <tr key={`${item.ingredientId}-base-version-${index}`}><td>{item.name || item.ingredientId}</td><td>{item.scaledGrams.toFixed(1)}</td><td>{item.percent.toFixed(2)}%</td></tr>)}
              </tbody>
            </table>
          </div>
          <div className="tableWrap compactTable">
            <table>
              <thead><tr><th>Saborizante/aditivo</th><th>g</th><th>%</th></tr></thead>
              <tbody>
                {flavor.map((item, index) => <tr key={`${item.ingredientId}-flavor-version-${index}`}><td>{item.name || item.ingredientId}</td><td>{item.scaledGrams.toFixed(1)}</td><td>{item.percent.toFixed(2)}%</td></tr>)}
                {flavor.length === 0 && <tr><td colSpan={3} className="emptyCell">Sin saborizantes registrados.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        <div className="actions versionActions">
          <Button variant="secondary" onClick={() => restoreVersion(selectedVersionView.versionNumber)}>Regresar a esta versión</Button>
          <Button onClick={() => approveVersionForProduction(selectedVersionView.versionNumber)}>Aprobar esta versión para producción</Button>
        </div>
      </div>
    );
  }

  if (!recipeId) {
    return (
      <section className="sectionBlock experimentPanel">
        <div className="sectionHeader">
          <div>
            <h3>Ensayos, notas e historial</h3>
            <p className="panelText">Guarda primero la receta. Después podrás agregar comentarios, calificar pruebas, ver versiones y aprobar la mejor fórmula para producción.</p>
          </div>
          <div className="scorePill">Pendiente de guardar</div>
        </div>
      </section>
    );
  }

  const recipe = timeline?.recipe;
  const status: BalanceStatus = recipe?.approvedForProduction ? "ok" : recipe?.bestRating && recipe.bestRating >= 4 ? "warning" : "error";

  return (
    <section className="sectionBlock experimentPanel">
      <div className="sectionHeader">
        <div>
          <h3>Ensayos, notas, versiones e historial</h3>
          <p className="panelText">Cada nota queda ligada a la versión actual. Puedes inspeccionar v2, v3 o cualquier versión, restaurarla como una nueva versión o aprobar esa versión específica para producción.</p>
        </div>
        <Badge status={status}>{recipe?.approvedForProduction ? `Producción v${recipe.productionApprovedVersion ?? recipe.versionNumber}` : `v${recipe?.versionNumber ?? 1} ensayo`}</Badge>
      </div>

      <div className="miniStats experimentStats">
        <span><strong>{ratingLabel(recipe?.averageRating)}</strong><small>Promedio ensayos</small></span>
        <span><strong>{ratingLabel(recipe?.bestRating)}</strong><small>Mejor calificación</small></span>
        <span><strong>{recipe?.versionNumber ?? 1}</strong><small>Versión actual</small></span>
        <span><strong>{versions.length}</strong><small>Versiones visibles</small></span>
      </div>

      {bestNote && (
        <div className="infoBox">
          <strong>Mejor ensayo registrado: {ratingLabel(bestNote.rating)}</strong>
          <p>{bestNote.comment}</p>
          <small className="muted">{bestNote.author || "Sin autor"} · {formatDate(bestNote.createdAt)}</small>
        </div>
      )}

      <div className="formGrid twoColumnForm experimentForm">
        <Input label="Autor" value={author} onChange={(event) => setAuthor(event.target.value)} />
        <Input label="Calificación decimal del ensayo" type="number" min={1} max={5} step="0.05" value={rating} onChange={(event) => setRating(Number(event.target.value))} />
      </div>
      <label className="fullField">
        <span>Nota del ensayo</span>
        <textarea className="input textArea" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Ejemplo: buena textura, falta aroma, bajar dulzor, subir café 10 g, comportamiento en vitrina..." />
      </label>
      <div className="actions">
        <Button onClick={addNote}>Guardar nota de ensayo</Button>
      </div>

      <div className="versionLab">
        <div className="sectionHeader">
          <div>
            <h4>Versiones de la receta</h4>
            <p className="panelText">Selecciona una versión para ver exactamente qué ingredientes y gramos se usaron. Puedes volver a esa fórmula o mandarla a producción.</p>
          </div>
          <div className="scorePill">{versions.length} versión(es)</div>
        </div>
        <label className="fullField">
          <span>Notas para restaurar o aprobar versión</span>
          <textarea className="input textArea" value={versionNotes} onChange={(event) => setVersionNotes(event.target.value)} placeholder="Ejemplo: seleccionar v2 porque tuvo mejor cuerpo, menor cristalización y mejor sabor en vitrina." />
        </label>
        <div className="versionGrid">
          {versions.map((version) => (
            <article className={`versionCard ${selectedVersionView?.versionNumber === version.versionNumber ? "selected" : ""}`} key={`${version.versionNumber}-${version.entry.id}`}>
              <div>
                <strong>v{version.versionNumber}</strong>
                <p>{actionLabel(version.entry.action)}</p>
                <small>{formatDate(version.entry.createdAt)}</small>
              </div>
              <div className="actions">
                <Button variant="secondary" onClick={() => setSelectedVersion(version.versionNumber)}>Ver</Button>
              </div>
            </article>
          ))}
        </div>
        {renderSelectedVersion()}
      </div>

      <div className="approvalBox">
        <h4>Aprobar versión actual para producción</h4>
        <p className="panelText">Este botón aprueba la versión actual. Si quieres aprobar una versión antigua, selecciónala arriba y usa “Aprobar esta versión para producción”.</p>
        <label className="fullField">
          <span>Notas para producción</span>
          <textarea className="input textArea" value={approvalNotes} onChange={(event) => setApprovalNotes(event.target.value)} placeholder="Ejemplo: pasteurizar, madurar 8 h, mantecar, abatir y exhibir a -13 °C." />
        </label>
        <Button onClick={approveProduction}>Aprobar versión actual</Button>
      </div>

      <div className="timelineGrid">
        <div>
          <h4>Notas de prueba</h4>
          <div className="timelineList">
            {(timeline?.notes ?? []).map((note) => (
              <article className="timelineItem" key={note.id}>
                <strong>{ratingLabel(note.rating)} · {note.author || "Sin autor"}</strong>
                <p>{note.comment}</p>
                <small>{formatDate(note.createdAt)}</small>
              </article>
            ))}
            {timeline?.notes.length === 0 && <p className="footerNote">Aún no hay notas de ensayo.</p>}
          </div>
        </div>
        <div>
          <h4>Historial completo</h4>
          <div className="timelineList">
            {(timeline?.history ?? []).map((entry) => (
              <article className="timelineItem" key={entry.id}>
                <strong>{actionLabel(entry.action)} · v{entry.versionNumber}</strong>
                <p>{entry.summary}</p>
                <small>{entry.author ? `${entry.author} · ` : ""}{formatDate(entry.createdAt)}</small>
              </article>
            ))}
            {timeline?.history.length === 0 && <p className="footerNote">Aún no hay historial registrado.</p>}
          </div>
        </div>
      </div>

      <p className="footerNote">{message || "El historial conserva la secuencia de cambios para comparar ensayos y elegir la receta con mejor calificación antes de venderla."}</p>
    </section>
  );
}
