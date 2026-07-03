"use client";

import { useState } from "react";
import { RecipeInput } from "@gelato/gelato-core";
import { RecipeBuilder } from "../organisms/RecipeBuilder";
import { NeutralBuilder } from "../organisms/NeutralBuilder";
import { SavedRecipesPanel } from "../organisms/SavedRecipesPanel";
import { ProcurementManager } from "../organisms/ProcurementManager";
import { ProductionRecipesPanel } from "../organisms/ProductionRecipesPanel";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "/api";
const swaggerUrl = apiBaseUrl === "/api" ? "/api/docs" : `${apiBaseUrl}/docs`;

type Tab = "recipe" | "saved" | "production" | "procurement" | "neutral";

export function GelatoDashboardTemplate() {
  const [tab, setTab] = useState<Tab>("recipe");
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<RecipeInput | undefined>(undefined);
  const [refreshToken, setRefreshToken] = useState(0);

  function openRecipeForEdit(id: string, recipe: RecipeInput) {
    setEditingRecipeId(id);
    setEditingRecipe(recipe);
    setTab("recipe");
  }

  function markSaved() {
    setRefreshToken((current) => current + 1);
  }

  return (
    <main className="shell">
      <section className="hero">
        <div className="heroCard">
          <h1>Ñam Gelato Lab</h1>
          <p>
            Plataforma para crear, editar, visualizar, escalar y balancear recetas de gelato. Calcula gramos por lote,
            sólidos totales, grasa, sólidos lácteos, azúcares, PAC, POD, lactosa, neutro, costo y proveedor recomendado.
          </p>
          <div className="tabs">
            <button className={`tab ${tab === "recipe" ? "active" : ""}`} onClick={() => setTab("recipe")}>{editingRecipeId ? "Editar receta" : "Crear receta"}</button>
            <button className={`tab ${tab === "saved" ? "active" : ""}`} onClick={() => setTab("saved")}>Recetas creadas</button>
            <button className={`tab ${tab === "production" ? "active" : ""}`} onClick={() => setTab("production")}>Producción</button>
            <button className={`tab ${tab === "procurement" ? "active" : ""}`} onClick={() => setTab("procurement")}>Ingredientes y proveedores</button>
            <button className={`tab ${tab === "neutral" ? "active" : ""}`} onClick={() => setTab("neutral")}>Neutro propio</button>
            <a className="tab linkTab" href={swaggerUrl} target="_blank" rel="noreferrer">Swagger API</a>
          </div>
        </div>
        <div className="heroStats heroCard">
          <div className="stat"><span>Escalado automático</span><strong>1-5 kg+</strong></div>
          <div className="stat"><span>Tipos de helado</span><strong>11</strong></div>
          <div className="stat"><span>Costos</span><strong>COP/kg</strong></div>
          <div className="stat"><span>Ensayos</span><strong>Notas</strong></div>
        </div>
      </section>

      {tab === "recipe" && (
        <>
          <RecipeBuilder editingRecipeId={editingRecipeId} initialRecipe={editingRecipe} onSaved={markSaved} />
          <div className="recipeListInsideBuilder">
            <SavedRecipesPanel refreshToken={refreshToken} onEdit={openRecipeForEdit} compact />
          </div>
        </>
      )}
      {tab === "saved" && <SavedRecipesPanel refreshToken={refreshToken} onEdit={openRecipeForEdit} />}
      {tab === "production" && <ProductionRecipesPanel refreshToken={refreshToken} />}
      {tab === "procurement" && <ProcurementManager />}
      {tab === "neutral" && <NeutralBuilder />}

      <p className="footerNote">
        Nota técnica: los rangos son una guía de formulación. El resultado final también depende de pasteurización, maduración,
        overrun, abatimiento, temperatura de vitrina y calidad de insumos.
      </p>
    </main>
  );
}
