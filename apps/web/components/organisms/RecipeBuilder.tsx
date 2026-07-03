"use client";

import { useEffect, useMemo, useState } from "react";
import {
  calculateRecipeBalance,
  DEFAULT_INGREDIENTS,
  IngredientDefinition,
  RecipeInput,
  RecipeIngredientInput,
  RecipeIngredientSection,
  RecipeType
} from "@gelato/gelato-core";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";
import { Select } from "../atoms/Select";
import { IngredientRow } from "../molecules/IngredientRow";
import { RecipeBalancePanel } from "./RecipeBalancePanel";
import { RecipeExperimentPanel } from "./RecipeExperimentPanel";
import { apiGet, apiPost, apiPut } from "../../lib/api-client";
import { ingredientWithBestPrice } from "../../lib/procurement";
import { localRecipeTemplateForType } from "../../lib/recipe-templates";
import { WEB_RECIPE_TYPE_OPTIONS, getWebRecipeTypeInfo } from "../../lib/recipe-types";
import { calculateRecipeSectionSummary } from "../../lib/recipe-sections";

interface Props {
  editingRecipeId?: string | null;
  initialRecipe?: RecipeInput;
  onSaved?: () => void;
}

function defaultIngredientCatalog(): IngredientDefinition[] {
  return DEFAULT_INGREDIENTS.map((ingredient) => ({
    ...ingredient,
    basePriceCOPPerKg: ingredient.composition.costCOPPerKg ?? 0,
    supplierPrices: []
  }));
}

function inferSection(item: RecipeIngredientInput, catalog: IngredientDefinition[]): RecipeIngredientSection {
  if (item.section === "base" || item.section === "flavor") return item.section;
  const found = catalog.find((ingredient) => ingredient.id === item.ingredientId) ?? DEFAULT_INGREDIENTS.find((ingredient) => ingredient.id === item.ingredientId);
  return found?.category === "flavor" ? "flavor" : "base";
}

function hydrateRecipeWithCatalog(recipe: RecipeInput, catalog: IngredientDefinition[]): RecipeInput {
  return {
    ...recipe,
    ingredients: recipe.ingredients.map((item) => {
      const found = catalog.find((ingredient) => ingredient.id === item.ingredientId);
      if (!found) return { ...item, section: inferSection(item, catalog) };
      const priced = ingredientWithBestPrice(found);
      return { ...item, section: inferSection(item, catalog), name: priced.name, composition: priced.composition };
    })
  };
}

function firstIngredientForSection(catalog: IngredientDefinition[], section: RecipeIngredientSection): IngredientDefinition {
  const match = catalog.find((ingredient) => section === "flavor" ? ingredient.category === "flavor" : ingredient.category !== "flavor");
  return match ?? catalog[0] ?? defaultIngredientCatalog()[0];
}

export function RecipeBuilder({ editingRecipeId = null, initialRecipe, onSaved }: Props) {
  const [recipe, setRecipe] = useState<RecipeInput>(initialRecipe ?? localRecipeTemplateForType("coffee", 1000));
  const [ingredients, setIngredients] = useState<IngredientDefinition[]>(defaultIngredientCatalog());
  const [saveMessage, setSaveMessage] = useState<string>("");
  const [activeRecipeId, setActiveRecipeId] = useState<string | null>(editingRecipeId);
  const [experimentRefreshToken, setExperimentRefreshToken] = useState(0);

  useEffect(() => {
    setActiveRecipeId(editingRecipeId);
  }, [editingRecipeId]);

  useEffect(() => {
    if (initialRecipe) setRecipe(hydrateRecipeWithCatalog(initialRecipe, ingredients));
  }, [initialRecipe, ingredients]);

  async function loadIngredients() {
    try {
      const data = await apiGet<IngredientDefinition[]>("/catalog/ingredients");
      const nextCatalog = data.length > 0 ? data : defaultIngredientCatalog();
      setIngredients(nextCatalog);
      setRecipe((current) => hydrateRecipeWithCatalog(current, nextCatalog));
    } catch (error) {
      const fallback = defaultIngredientCatalog();
      setIngredients(fallback);
      setRecipe((current) => hydrateRecipeWithCatalog(current, fallback));
    }
  }

  useEffect(() => { void loadIngredients(); }, []);

  const recipeTypeInfo = getWebRecipeTypeInfo(recipe.type);
  const balance = useMemo(() => calculateRecipeBalance(recipe), [recipe]);
  const sectionSummary = useMemo(() => calculateRecipeSectionSummary(recipe, balance, ingredients), [recipe, balance, ingredients]);
  const scaledMap = useMemo(() => new Map((balance.scaledIngredients ?? []).map((item, index) => [index, item])), [balance]);
  const sectionRows = useMemo(() => ({
    base: recipe.ingredients
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => inferSection(item, ingredients) === "base"),
    flavor: recipe.ingredients
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => inferSection(item, ingredients) === "flavor")
  }), [recipe.ingredients, ingredients]);

  function updateIngredient(index: number, next: RecipeIngredientInput) {
    setRecipe((current) => ({
      ...current,
      ingredients: current.ingredients.map((item, itemIndex) => itemIndex === index ? next : item)
    }));
  }

  function removeIngredient(index: number) {
    setRecipe((current) => ({ ...current, ingredients: current.ingredients.filter((_, itemIndex) => itemIndex !== index) }));
  }

  function addIngredient(section: RecipeIngredientSection) {
    const first = ingredientWithBestPrice(firstIngredientForSection(ingredients, section));
    setRecipe((current) => ({
      ...current,
      ingredients: [...current.ingredients, { ingredientId: first.id, name: first.name, grams: 0, section, composition: first.composition }]
    }));
  }

  function loadTemplateForSelectedType(type = recipe.type, targetWeightGrams = recipe.targetWeightGrams) {
    const template = hydrateRecipeWithCatalog(localRecipeTemplateForType(type, targetWeightGrams), ingredients);
    setRecipe(template);
    setSaveMessage(`Plantilla de ${getWebRecipeTypeInfo(type).label} cargada. Ajusta saborizantes, gramos o peso y guarda.`);
  }

  async function saveRecipe() {
    setSaveMessage(editingRecipeId ? "Actualizando receta..." : "Guardando receta...");
    const payload = hydrateRecipeWithCatalog(recipe, ingredients);
    try {
      if (activeRecipeId) {
        await apiPut(`/recipes/${activeRecipeId}`, payload);
        setSaveMessage("Receta actualizada en el backend. Se creó una nueva versión en el historial.");
      } else {
        const created = await apiPost<{ id: string }>("/recipes", payload);
        setActiveRecipeId(created.id);
        setSaveMessage("Receta guardada en el backend. Ya puedes agregar notas de ensayo.");
      }
      setExperimentRefreshToken((current) => current + 1);
      onSaved?.();
    } catch (error) {
      setSaveMessage("No se pudo guardar en API. El cálculo local sigue funcionando.");
    }
  }

  function renderIngredientSection(section: RecipeIngredientSection) {
    const rows = sectionRows[section];
    const title = section === "base" ? "Ingredientes base obligatorios" : "Saborizantes y aditivos de sabor";
    const text = section === "base"
      ? "Son los insumos que construyen la estructura del gelato: leche/agua, crema o grasa, azúcares, sólidos, neutro y fibras. Normalmente siempre deben existir."
      : "Son los ingredientes que definen el sabor: café, lulo, chocolate, frutas, vainilla, pistacho, cacao, etc. Al cambiarlos también cambian agua, sólidos, grasa, PAC, POD y costo.";
    const weight = section === "base" ? sectionSummary.baseWeightGrams : sectionSummary.flavorWeightGrams;
    const percent = section === "base" ? sectionSummary.basePercent : sectionSummary.flavorPercent;

    return (
      <div className="sectionBlock" key={section}>
        <div className="sectionHeader">
          <div>
            <h3>{title}</h3>
            <p className="panelText">{text}</p>
          </div>
          <div className="scorePill">{weight.toFixed(1)} g · {percent.toFixed(2)}%</div>
        </div>
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Ingrediente</th>
                <th>Sección</th>
                <th>Gramos fórmula base</th>
                <th>Gramos escalados</th>
                <th>% receta</th>
                <th>Costo kg</th>
                <th>Costo lote</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ item, index }) => {
                const scaled = scaledMap.get(index);
                return (
                  <IngredientRow
                    key={`${item.ingredientId}-${index}`}
                    row={{ ...item, section: inferSection(item, ingredients) }}
                    scaledGrams={scaled?.scaledGrams}
                    percent={scaled?.percent}
                    availableIngredients={ingredients}
                    onChange={(next) => updateIngredient(index, next)}
                    onRemove={() => removeIngredient(index)}
                  />
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="emptyCell">No hay ingredientes en esta sección.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="actions sectionActions">
          <Button onClick={() => addIngredient(section)}>Agregar {section === "base" ? "base" : "saborizante"}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid">
      <section className="panel">
        <div className="panelHeader">
          <div>
            <h2 className="panelTitle">{activeRecipeId ? "Editar receta" : "Crear receta"}</h2>
            <p className="panelText">La receta ahora está dividida entre base técnica y saborizantes. Cambia tipo, gramos o peso final y el sistema recalcula automáticamente para 1 kg, 2 kg o cualquier producción.</p>
          </div>
          <div className="actions">
            <Button variant="secondary" onClick={() => loadTemplateForSelectedType()}>Cargar plantilla del tipo</Button>
            <Button variant="secondary" onClick={loadIngredients}>Actualizar insumos</Button>
            <Button onClick={saveRecipe}>{activeRecipeId ? "Actualizar" : "Guardar"}</Button>
          </div>
        </div>

        {activeRecipeId && <p className="editBanner">Esta receta ya está guardada. Cada cambio de fórmula crea una nueva versión en el historial y desactiva la aprobación de producción hasta que vuelvas a aprobarla.</p>}

        <div className="formGrid">
          <Input label="Nombre" value={recipe.name} onChange={(event) => setRecipe({ ...recipe, name: event.target.value })} />
          <Select label="Tipo de helado" value={recipe.type} onChange={(event) => setRecipe({ ...recipe, type: event.target.value as RecipeType })}>
            {WEB_RECIPE_TYPE_OPTIONS.map((type) => <option key={type.id} value={type.id}>{type.label}</option>)}
          </Select>
          <Input label="Peso deseado de gelato (g)" type="number" min={1} step="50" value={recipe.targetWeightGrams} onChange={(event) => setRecipe({ ...recipe, targetWeightGrams: Number(event.target.value) })} />
        </div>

        <div className="infoBox recipeTypeBox">
          <strong>{recipeTypeInfo.label}</strong>
          <p>{recipeTypeInfo.description}</p>
        </div>

        <div className="actions" style={{ marginBottom: 14 }}>
          {[1000, 2000, 3000, 5000].map((weight) => (
            <Button key={weight} variant="secondary" onClick={() => setRecipe({ ...recipe, targetWeightGrams: weight })}>{weight / 1000} kg</Button>
          ))}
          <span className="muted">Total fórmula base: {recipe.ingredients.reduce((sum, item) => sum + item.grams, 0).toFixed(1)} g</span>
        </div>

        {renderIngredientSection("base")}
        {renderIngredientSection("flavor")}

        <RecipeExperimentPanel
          recipeId={activeRecipeId}
          refreshToken={experimentRefreshToken}
          onVersionRestored={(restoredRecipe) => {
            setRecipe(hydrateRecipeWithCatalog({
              name: restoredRecipe.name,
              type: restoredRecipe.type,
              targetWeightGrams: restoredRecipe.targetWeightGrams,
              ingredients: restoredRecipe.ingredients
            }, ingredients));
            setActiveRecipeId(restoredRecipe.id);
          }}
          onChanged={() => {
            setExperimentRefreshToken((current) => current + 1);
            onSaved?.();
          }}
        />

        <p className="footerNote">{saveMessage || "Los indicadores se recalculan sin guardar. Guarda cuando la fórmula esté lista."}</p>
      </section>

      <RecipeBalancePanel balance={balance} />
    </div>
  );
}
