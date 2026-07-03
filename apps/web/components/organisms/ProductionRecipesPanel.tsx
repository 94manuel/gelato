"use client";

import { useEffect, useMemo, useState } from "react";
import { calculateRecipeBalance, RecipeInput, SavedRecipe } from "@gelato/gelato-core";
import { Badge } from "../atoms/Badge";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";
import { apiGet } from "../../lib/api-client";
import { formatCOP } from "../../lib/procurement";
import { getWebRecipeTypeLabel } from "../../lib/recipe-types";


function isProductionSnapshot(value: unknown): value is SavedRecipe {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<SavedRecipe>;
  return typeof candidate.name === "string" && typeof candidate.type === "string" && Array.isArray(candidate.ingredients);
}

function productionFormula(recipe: SavedRecipe): SavedRecipe {
  if (isProductionSnapshot(recipe.productionSnapshot)) {
    return {
      ...recipe.productionSnapshot,
      id: recipe.id,
      averageRating: recipe.averageRating,
      bestRating: recipe.bestRating,
      approvedForProduction: recipe.approvedForProduction,
      productionApprovedAt: recipe.productionApprovedAt,
      productionApprovedBy: recipe.productionApprovedBy,
      productionApprovedNotes: recipe.productionApprovedNotes,
      productionApprovedVersion: recipe.productionApprovedVersion,
      productionSnapshot: recipe.productionSnapshot
    };
  }
  return recipe;
}

function formatDate(value?: string | Date | null) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return date.toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

export function ProductionRecipesPanel({ refreshToken = 0 }: { refreshToken?: number }) {
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  async function loadProductionRecipes() {
    setMessage("Cargando recetas aprobadas para producción...");
    try {
      const data = await apiGet<SavedRecipe[]>("/recipes/production");
      setRecipes(data);
      setMessage(data.length === 0 ? "Aún no hay recetas aprobadas para producción." : "");
    } catch (error) {
      setMessage("No se pudo cargar producción. Revisa el backend.");
    }
  }

  useEffect(() => { void loadProductionRecipes(); }, [refreshToken]);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return recipes;
    return recipes.filter((recipe) => `${recipe.name} ${recipe.type} ${getWebRecipeTypeLabel(recipe.type)}`.toLowerCase().includes(value));
  }, [recipes, query]);

  return (
    <section className="panel fullPanel productionPanel">
      <div className="panelHeader">
        <div>
          <h2 className="panelTitle">Área de producción</h2>
          <p className="panelText">Aquí solo aparecen las recetas aprobadas. Producción puede ver lote, versión aprobada, gramos escalados, costo y notas operativas.</p>
        </div>
        <Button variant="secondary" onClick={loadProductionRecipes}>Actualizar</Button>
      </div>

      <div className="formGrid compactForm">
        <Input label="Buscar receta aprobada" placeholder="Café, lulo, chocolate..." value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>

      <div className="productionList">
        {filtered.map((recipe) => {
          const formula = productionFormula(recipe);
          const balance = calculateRecipeBalance(formula as RecipeInput);
          const base = balance.scaledIngredients.filter((item) => item.section !== "flavor");
          const flavor = balance.scaledIngredients.filter((item) => item.section === "flavor");
          return (
            <article className="productionCard" key={recipe.id}>
              <div className="panelHeader compactHeader">
                <div>
                  <h3>{formula.name}</h3>
                  <p className="panelText">
                    {getWebRecipeTypeLabel(formula.type)} · lote {formula.targetWeightGrams.toLocaleString("es-CO")} g · versión aprobada v{recipe.productionApprovedVersion ?? formula.versionNumber ?? recipe.versionNumber ?? 1}
                  </p>
                </div>
                <Badge status="ok">Lista para producción</Badge>
              </div>

              <div className="miniStats">
                <span><strong>{balance.score}/100</strong><small>Balance</small></span>
                <span><strong>{Number(recipe.bestRating ?? 0).toFixed(2)}/5</strong><small>Mejor prueba</small></span>
                <span><strong>{formatCOP(balance.totals.costCOP)}</strong><small>Costo lote</small></span>
              </div>

              <div className="infoBox">
                <strong>Notas de producción</strong>
                <p>{recipe.productionApprovedNotes || "Sin notas específicas. Seguir proceso estándar de pasteurización, maduración, mantecación, abatimiento y vitrina."}</p>
                <small className="muted">Aprobada por {recipe.productionApprovedBy || "Gelato Lab"} · {formatDate(recipe.productionApprovedAt)}</small>
                {recipe.productionApprovedVersion !== recipe.versionNumber && <p className="productionVersionNotice">Esta ficha usa una versión histórica aprobada, no necesariamente la fórmula actual de laboratorio.</p>}
              </div>

              <div className="productionTables">
                <div className="tableWrap compactTable">
                  <table>
                    <thead><tr><th>Base requerida</th><th>Gramos</th><th>%</th></tr></thead>
                    <tbody>
                      {base.map((item, index) => <tr key={`${item.ingredientId}-base-${index}`}><td>{item.name || item.ingredientId}</td><td>{item.scaledGrams.toFixed(1)}</td><td>{item.percent.toFixed(2)}%</td></tr>)}
                    </tbody>
                  </table>
                </div>
                <div className="tableWrap compactTable">
                  <table>
                    <thead><tr><th>Sabor/aditivo</th><th>Gramos</th><th>%</th></tr></thead>
                    <tbody>
                      {flavor.map((item, index) => <tr key={`${item.ingredientId}-flavor-${index}`}><td>{item.name || item.ingredientId}</td><td>{item.scaledGrams.toFixed(1)}</td><td>{item.percent.toFixed(2)}%</td></tr>)}
                      {flavor.length === 0 && <tr><td colSpan={3} className="emptyCell">Sin saborizantes registrados.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <p className="footerNote">{message || `${filtered.length} receta(s) aprobadas.`}</p>
    </section>
  );
}
