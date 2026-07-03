"use client";

import { useEffect, useMemo, useState } from "react";
import { calculateRecipeBalance, RecipeInput, SavedRecipe } from "@gelato/gelato-core";
import { Badge } from "../atoms/Badge";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";
import { apiDelete, apiGet } from "../../lib/api-client";
import { formatCOP } from "../../lib/procurement";
import { getWebRecipeTypeLabel } from "../../lib/recipe-types";
import { calculateRecipeSectionSummary } from "../../lib/recipe-sections";

interface Props {
  refreshToken?: number;
  onEdit: (id: string, recipe: RecipeInput) => void;
  compact?: boolean;
}

export function SavedRecipesPanel({ refreshToken = 0, onEdit, compact = false }: Props) {
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  async function loadRecipes() {
    setMessage("Cargando recetas...");
    try {
      const data = await apiGet<SavedRecipe[]>("/recipes");
      setRecipes(data);
      setMessage(data.length === 0 ? "Aún no hay recetas guardadas." : "");
    } catch (error) {
      setMessage("No se pudo leer el backend. Revisa que el API esté en http://localhost:3001.");
    }
  }

  useEffect(() => { void loadRecipes(); }, [refreshToken]);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return recipes;
    return recipes.filter((recipe) => `${recipe.name} ${recipe.type} ${getWebRecipeTypeLabel(recipe.type)}`.toLowerCase().includes(value));
  }, [recipes, query]);

  async function removeRecipe(id: string) {
    try {
      await apiDelete<void>(`/recipes/${id}`);
      setRecipes((current) => current.filter((recipe) => recipe.id !== id));
    } catch (error) {
      setMessage("No se pudo eliminar la receta.");
    }
  }

  return (
    <section className={`panel fullPanel ${compact ? "embeddedList" : ""}`}>
      <div className="panelHeader">
        <div>
          <h2 className="panelTitle">Recetas existentes</h2>
          <p className="panelText">Lista de recetas guardadas. Desde aquí puedes abrir cualquier receta para editarla, cambiar el peso final y recalcular base, saborizantes, costos e indicadores.</p>
        </div>
        <Button variant="secondary" onClick={loadRecipes}>Actualizar</Button>
      </div>

      <div className="formGrid compactForm">
        <Input label="Buscar receta" placeholder="Café, lulo, chocolate, sorbete..." value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>

      <div className="cardsGrid">
        {filtered.map((recipe) => {
          const balance = calculateRecipeBalance(recipe);
          const sections = calculateRecipeSectionSummary(recipe, balance);
          return (
            <article className="recipeCard" key={recipe.id}>
              <div className="panelHeader compactHeader">
                <div>
                  <h3>{recipe.name}</h3>
                  <p className="panelText">{getWebRecipeTypeLabel(recipe.type)} · {recipe.targetWeightGrams.toLocaleString("es-CO")} g · {recipe.ingredients.length} ingredientes</p>
                </div>
                <div className="cardBadges">
                  {recipe.approvedForProduction && <Badge status="ok">Producción</Badge>}
                  <Badge status={balance.status}>{balance.status === "ok" ? "Balanceada" : balance.status === "warning" ? "Revisar" : "Corregir"}</Badge>
                </div>
              </div>
              <div className="miniStats">
                <span><strong>{balance.score}/100</strong><small>Balance</small></span>
                <span><strong>{Number(recipe.bestRating ?? 0).toFixed(2)}/5</strong><small>Mejor ensayo</small></span>
                <span><strong>v{recipe.versionNumber ?? 1}</strong><small>Versión actual</small></span>
                <span><strong>{formatCOP(balance.totals.costCOP)}</strong><small>Costo lote</small></span>
                <span><strong>{sections.basePercent}% / {sections.flavorPercent}%</strong><small>Base / sabor</small></span>
                <span><strong>{recipe.approvedForProduction ? `v${recipe.productionApprovedVersion ?? recipe.versionNumber ?? 1}` : "No"}</strong><small>Producción</small></span>
              </div>
              <div className="actions">
                <Button onClick={() => onEdit(recipe.id, {
                  name: recipe.name,
                  type: recipe.type,
                  targetWeightGrams: recipe.targetWeightGrams,
                  ingredients: recipe.ingredients
                })}>Editar</Button>
                <Button variant="danger" onClick={() => removeRecipe(recipe.id)}>Eliminar</Button>
              </div>
            </article>
          );
        })}
      </div>
      <p className="footerNote">{message || `${filtered.length} receta(s) encontradas.`}</p>
    </section>
  );
}
