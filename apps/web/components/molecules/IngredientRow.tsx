import { DEFAULT_INGREDIENTS, IngredientDefinition, RecipeIngredientInput, RecipeIngredientSection } from "@gelato/gelato-core";
import { Button } from "../atoms/Button";
import { formatCOP, ingredientWithBestPrice } from "../../lib/procurement";

interface Props {
  row: RecipeIngredientInput;
  scaledGrams?: number;
  percent?: number;
  availableIngredients?: IngredientDefinition[];
  onChange: (next: RecipeIngredientInput) => void;
  onRemove: () => void;
}

function inferSectionFromCatalog(ingredientId: string, availableIngredients: IngredientDefinition[]): RecipeIngredientSection {
  const found = availableIngredients.find((ingredient) => ingredient.id === ingredientId) ?? DEFAULT_INGREDIENTS.find((ingredient) => ingredient.id === ingredientId);
  return found?.category === "flavor" ? "flavor" : "base";
}

export function IngredientRow({ row, scaledGrams = 0, percent = 0, availableIngredients = DEFAULT_INGREDIENTS, onChange, onRemove }: Props) {
  function selectIngredient(ingredientId: string) {
    const found = availableIngredients.find((ingredient) => ingredient.id === ingredientId) ?? DEFAULT_INGREDIENTS.find((ingredient) => ingredient.id === ingredientId);
    if (!found) {
      onChange({ ...row, ingredientId });
      return;
    }
    const priced = ingredientWithBestPrice(found);
    onChange({
      ...row,
      ingredientId,
      name: priced.name,
      section: row.section ?? inferSectionFromCatalog(ingredientId, availableIngredients),
      composition: priced.composition
    });
  }

  const selected = availableIngredients.find((ingredient) => ingredient.id === row.ingredientId);
  const costCOPPerKg = row.composition?.costCOPPerKg ?? selected?.basePriceCOPPerKg ?? selected?.composition.costCOPPerKg ?? 0;
  const ingredientCost = (scaledGrams * costCOPPerKg) / 1000;

  return (
    <tr>
      <td>
        <select
          className="select"
          value={row.ingredientId}
          onChange={(event) => selectIngredient(event.target.value)}
        >
          {availableIngredients.map((ingredient) => (
            <option key={ingredient.id} value={ingredient.id}>{ingredient.name}</option>
          ))}
        </select>
      </td>
      <td>
        <select
          className="select"
          value={row.section ?? inferSectionFromCatalog(row.ingredientId, availableIngredients)}
          onChange={(event) => onChange({ ...row, section: event.target.value as RecipeIngredientSection })}
        >
          <option value="base">Base requerida</option>
          <option value="flavor">Saborizante/aditivo</option>
        </select>
      </td>
      <td>
        <input
          className="input"
          type="number"
          min={0}
          step="0.1"
          value={row.grams}
          onChange={(event) => onChange({ ...row, grams: Number(event.target.value) })}
        />
      </td>
      <td><strong>{scaledGrams.toFixed(1)} g</strong></td>
      <td>{percent.toFixed(2)}%</td>
      <td>{formatCOP(costCOPPerKg)}</td>
      <td><strong>{formatCOP(ingredientCost)}</strong></td>
      <td><Button variant="danger" onClick={onRemove}>Quitar</Button></td>
    </tr>
  );
}
