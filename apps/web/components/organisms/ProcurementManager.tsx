"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_INGREDIENTS,
  IngredientCategory,
  IngredientComposition,
  IngredientDefinition,
  SupplierDefinition
} from "@gelato/gelato-core";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";
import { Select } from "../atoms/Select";
import { apiDelete, apiGet, apiPost, apiPut } from "../../lib/api-client";
import { formatCOP, getBestSupplierPrice } from "../../lib/procurement";

const EMPTY_COMPOSITION: IngredientComposition = {
  water: 0,
  fat: 0,
  milkSolidsNonFat: 0,
  sucrose: 0,
  dextrose: 0,
  glucose: 0,
  fructose: 0,
  lactose: 0,
  stabilizer: 0,
  otherSolids: 0,
  costCOPPerKg: 0
};

const compositionFields: Array<{ key: keyof IngredientComposition; label: string }> = [
  { key: "water", label: "Agua %" },
  { key: "fat", label: "Grasa %" },
  { key: "milkSolidsNonFat", label: "SLNG %" },
  { key: "sucrose", label: "Sacarosa %" },
  { key: "dextrose", label: "Dextrosa %" },
  { key: "glucose", label: "Glucosa %" },
  { key: "fructose", label: "Fructosa %" },
  { key: "lactose", label: "Lactosa %" },
  { key: "stabilizer", label: "Estabilizante %" },
  { key: "otherSolids", label: "Otros sólidos %" }
];

interface IngredientFormState {
  id?: string;
  name: string;
  category: IngredientCategory;
  basePriceCOPPerKg: number;
  composition: IngredientComposition;
}

interface SupplierFormState {
  id?: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  notes: string;
  qualityScore: number;
  serviceScore: number;
  priceScore: number;
  deliveryScore: number;
}

interface PriceFormState {
  ingredientId: string;
  supplierId: string;
  priceCOPPerKg: number;
  leadTimeDays: number;
  available: boolean;
  notes: string;
}

function clampSupplierScore(value: number): number {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return 0;
  return Math.max(0, Math.min(100, Math.round(numericValue)));
}

function calculateLocalSupplierTotalScore(input: SupplierFormState): number {
  const quality = clampSupplierScore(input.qualityScore);
  const service = clampSupplierScore(input.serviceScore);
  const price = clampSupplierScore(input.priceScore);
  const delivery = clampSupplierScore(input.deliveryScore);

  return Math.round((quality * 0.35 + price * 0.3 + service * 0.2 + delivery * 0.15) * 100) / 100;
}

function emptyIngredientForm(): IngredientFormState {
  return {
    name: "",
    category: "other",
    basePriceCOPPerKg: 0,
    composition: { ...EMPTY_COMPOSITION }
  };
}

function emptySupplierForm(): SupplierFormState {
  return {
    name: "",
    contactName: "",
    phone: "",
    email: "",
    notes: "",
    qualityScore: 80,
    serviceScore: 80,
    priceScore: 80,
    deliveryScore: 80
  };
}

export function ProcurementManager() {
  const [ingredients, setIngredients] = useState<IngredientDefinition[]>(DEFAULT_INGREDIENTS.map((ingredient) => ({
    ...ingredient,
    basePriceCOPPerKg: ingredient.composition.costCOPPerKg ?? 0,
    supplierPrices: []
  })));
  const [suppliers, setSuppliers] = useState<SupplierDefinition[]>([]);
  const [ingredientForm, setIngredientForm] = useState<IngredientFormState>(emptyIngredientForm());
  const [supplierForm, setSupplierForm] = useState<SupplierFormState>(emptySupplierForm());
  const [priceForm, setPriceForm] = useState<PriceFormState>({ ingredientId: "", supplierId: "", priceCOPPerKg: 0, leadTimeDays: 1, available: true, notes: "" });
  const [message, setMessage] = useState("");

  const supplierTotalScore = useMemo(() => calculateLocalSupplierTotalScore(supplierForm), [supplierForm]);

  async function loadData() {
    setMessage("Cargando ingredientes y proveedores...");
    try {
      const [ingredientData, supplierData] = await Promise.all([
        apiGet<IngredientDefinition[]>("/catalog/ingredients"),
        apiGet<SupplierDefinition[]>("/suppliers")
      ]);
      setIngredients(ingredientData);
      setSuppliers(supplierData);
      setPriceForm((current) => ({
        ...current,
        ingredientId: current.ingredientId || ingredientData[0]?.id || "",
        supplierId: current.supplierId || supplierData[0]?.id || ""
      }));
      setMessage("");
    } catch (error) {
      setMessage("No se pudo cargar desde el API. Se muestra el catálogo base local mientras levantas el backend.");
    }
  }

  useEffect(() => { void loadData(); }, []);

  async function seedIngredients() {
    try {
      const data = await apiPost<IngredientDefinition[]>("/catalog/ingredients/seed", { seedDefaultIngredients: true });
      setIngredients(data);
      setMessage("Catálogo técnico base creado en la base de datos.");
    } catch (error) {
      setMessage("No se pudo crear el catálogo base.");
    }
  }

  function editIngredient(ingredient: IngredientDefinition) {
    setIngredientForm({
      id: ingredient.id,
      name: ingredient.name,
      category: ingredient.category,
      basePriceCOPPerKg: ingredient.basePriceCOPPerKg ?? ingredient.composition.costCOPPerKg ?? 0,
      composition: { ...ingredient.composition }
    });
  }

  async function saveIngredient() {
    const payload = {
      name: ingredientForm.name,
      category: ingredientForm.category,
      composition: {
        ...ingredientForm.composition,
        costCOPPerKg: ingredientForm.basePriceCOPPerKg
      },
      basePriceCOPPerKg: ingredientForm.basePriceCOPPerKg
    };
    try {
      if (ingredientForm.id) {
        await apiPut<IngredientDefinition>(`/catalog/ingredients/${ingredientForm.id}`, payload);
        setMessage("Ingrediente actualizado.");
      } else {
        await apiPost<IngredientDefinition>("/catalog/ingredients", payload);
        setMessage("Ingrediente creado.");
      }
      setIngredientForm(emptyIngredientForm());
      await loadData();
    } catch (error) {
      setMessage("No se pudo guardar el ingrediente.");
    }
  }

  async function removeIngredient(id: string) {
    try {
      await apiDelete<void>(`/catalog/ingredients/${id}`);
      setIngredients((current) => current.filter((ingredient) => ingredient.id !== id));
      setMessage("Ingrediente eliminado.");
    } catch (error) {
      setMessage("No se pudo eliminar el ingrediente. Puede estar usado por una receta o precio.");
    }
  }

  function editSupplier(supplier: SupplierDefinition) {
    setSupplierForm({
      id: supplier.id,
      name: supplier.name,
      contactName: supplier.contactName ?? "",
      phone: supplier.phone ?? "",
      email: supplier.email ?? "",
      notes: supplier.notes ?? "",
      qualityScore: supplier.qualityScore,
      serviceScore: supplier.serviceScore,
      priceScore: supplier.priceScore,
      deliveryScore: supplier.deliveryScore
    });
  }

  async function saveSupplier() {
    const payload = {
      name: supplierForm.name,
      contactName: supplierForm.contactName || undefined,
      phone: supplierForm.phone || undefined,
      email: supplierForm.email || undefined,
      notes: supplierForm.notes || undefined,
      qualityScore: Number(supplierForm.qualityScore),
      serviceScore: Number(supplierForm.serviceScore),
      priceScore: Number(supplierForm.priceScore),
      deliveryScore: Number(supplierForm.deliveryScore)
    };
    try {
      if (supplierForm.id) {
        await apiPut<SupplierDefinition>(`/suppliers/${supplierForm.id}`, payload);
        setMessage("Proveedor actualizado.");
      } else {
        await apiPost<SupplierDefinition>("/suppliers", payload);
        setMessage("Proveedor creado.");
      }
      setSupplierForm(emptySupplierForm());
      await loadData();
    } catch (error) {
      setMessage("No se pudo guardar el proveedor.");
    }
  }

  async function removeSupplier(id: string) {
    try {
      await apiDelete<void>(`/suppliers/${id}`);
      setSuppliers((current) => current.filter((supplier) => supplier.id !== id));
      setMessage("Proveedor eliminado.");
      await loadData();
    } catch (error) {
      setMessage("No se pudo eliminar el proveedor.");
    }
  }

  async function saveSupplierPrice() {
    if (!priceForm.supplierId || !priceForm.ingredientId) {
      setMessage("Selecciona ingrediente y proveedor antes de guardar el precio.");
      return;
    }
    try {
      await apiPost(`/suppliers/${priceForm.supplierId}/prices`, {
        ingredientId: priceForm.ingredientId,
        priceCOPPerKg: Number(priceForm.priceCOPPerKg),
        leadTimeDays: Number(priceForm.leadTimeDays),
        available: Boolean(priceForm.available),
        notes: priceForm.notes || undefined
      });
      setMessage("Precio por proveedor guardado.");
      await loadData();
    } catch (error) {
      setMessage("No se pudo guardar el precio del proveedor.");
    }
  }

  return (
    <div className="stackedGrid">
      <section className="panel fullPanel">
        <div className="panelHeader">
          <div>
            <h2 className="panelTitle">Ingredientes, precios y proveedores</h2>
            <p className="panelText">Administra el costo por kilo, la composición técnica y el proveedor recomendado por puntaje. El mejor proveedor se elige por puntaje total; si empatan, se toma el menor precio.</p>
          </div>
          <div className="actions">
            <Button variant="secondary" onClick={loadData}>Actualizar</Button>
            <Button onClick={seedIngredients}>Crear catálogo base</Button>
          </div>
        </div>

        <div className="grid twoColumns">
          <section className="card innerCard">
            <h3>{ingredientForm.id ? "Editar ingrediente" : "Nuevo ingrediente"}</h3>
            <div className="formGrid twoColumnForm">
              <Input label="Nombre" value={ingredientForm.name} onChange={(event) => setIngredientForm({ ...ingredientForm, name: event.target.value })} />
              <Select label="Categoría" value={ingredientForm.category} onChange={(event) => setIngredientForm({ ...ingredientForm, category: event.target.value as IngredientCategory })}>
                <option value="dairy">Lácteo</option>
                <option value="fat">Grasa</option>
                <option value="sugar">Azúcar</option>
                <option value="flavor">Sabor</option>
                <option value="neutral">Neutro</option>
                <option value="other">Otro</option>
              </Select>
              <Input label="Precio base COP/kg" type="number" min={0} value={ingredientForm.basePriceCOPPerKg} onChange={(event) => setIngredientForm({ ...ingredientForm, basePriceCOPPerKg: Number(event.target.value) })} />
            </div>
            <div className="compositionGrid">
              {compositionFields.map((field) => (
                <Input
                  key={field.key}
                  label={field.label}
                  type="number"
                  min={0}
                  step="0.01"
                  value={Number(ingredientForm.composition[field.key] ?? 0)}
                  onChange={(event) => setIngredientForm({
                    ...ingredientForm,
                    composition: { ...ingredientForm.composition, [field.key]: Number(event.target.value) }
                  })}
                />
              ))}
            </div>
            <div className="actions">
              <Button onClick={saveIngredient}>{ingredientForm.id ? "Actualizar ingrediente" : "Crear ingrediente"}</Button>
              <Button variant="secondary" onClick={() => setIngredientForm(emptyIngredientForm())}>Limpiar</Button>
            </div>
          </section>

          <section className="card innerCard">
            <h3>{supplierForm.id ? "Editar proveedor" : "Nuevo proveedor"}</h3>
            <div className="formGrid twoColumnForm">
              <Input label="Proveedor" value={supplierForm.name} onChange={(event) => setSupplierForm({ ...supplierForm, name: event.target.value })} />
              <Input label="Contacto" value={supplierForm.contactName} onChange={(event) => setSupplierForm({ ...supplierForm, contactName: event.target.value })} />
              <Input label="Teléfono" value={supplierForm.phone} onChange={(event) => setSupplierForm({ ...supplierForm, phone: event.target.value })} />
              <Input label="Email" value={supplierForm.email} onChange={(event) => setSupplierForm({ ...supplierForm, email: event.target.value })} />
              <Input label="Calidad 0-100" type="number" min={0} max={100} value={supplierForm.qualityScore} onChange={(event) => setSupplierForm({ ...supplierForm, qualityScore: Number(event.target.value) })} />
              <Input label="Servicio 0-100" type="number" min={0} max={100} value={supplierForm.serviceScore} onChange={(event) => setSupplierForm({ ...supplierForm, serviceScore: Number(event.target.value) })} />
              <Input label="Precio 0-100" type="number" min={0} max={100} value={supplierForm.priceScore} onChange={(event) => setSupplierForm({ ...supplierForm, priceScore: Number(event.target.value) })} />
              <Input label="Entrega 0-100" type="number" min={0} max={100} value={supplierForm.deliveryScore} onChange={(event) => setSupplierForm({ ...supplierForm, deliveryScore: Number(event.target.value) })} />
            </div>
            <label className="field fullField">
              <span>Notas</span>
              <textarea className="input textArea" value={supplierForm.notes} onChange={(event) => setSupplierForm({ ...supplierForm, notes: event.target.value })} />
            </label>
            <div className="stat compactStat">
              <span>Puntaje ponderado del proveedor</span>
              <strong>{supplierTotalScore}/100</strong>
              <small className="muted">Calidad 35%, precio 30%, servicio 20%, entrega 15%.</small>
            </div>
            <div className="actions">
              <Button onClick={saveSupplier}>{supplierForm.id ? "Actualizar proveedor" : "Crear proveedor"}</Button>
              <Button variant="secondary" onClick={() => setSupplierForm(emptySupplierForm())}>Limpiar</Button>
            </div>
          </section>
        </div>
      </section>

      <section className="panel fullPanel">
        <div className="panelHeader">
          <div>
            <h2 className="panelTitle">Precios por proveedor</h2>
            <p className="panelText">Asigna precios por kilo a cada ingrediente y proveedor. Estos precios alimentan el costo total de las recetas.</p>
          </div>
        </div>
        <div className="formGrid fiveColumnForm">
          <Select label="Ingrediente" value={priceForm.ingredientId} onChange={(event) => setPriceForm({ ...priceForm, ingredientId: event.target.value })}>
            <option value="">Seleccionar</option>
            {ingredients.map((ingredient) => <option key={ingredient.id} value={ingredient.id}>{ingredient.name}</option>)}
          </Select>
          <Select label="Proveedor" value={priceForm.supplierId} onChange={(event) => setPriceForm({ ...priceForm, supplierId: event.target.value })}>
            <option value="">Seleccionar</option>
            {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
          </Select>
          <Input label="Precio COP/kg" type="number" min={0} value={priceForm.priceCOPPerKg} onChange={(event) => setPriceForm({ ...priceForm, priceCOPPerKg: Number(event.target.value) })} />
          <Input label="Entrega días" type="number" min={0} value={priceForm.leadTimeDays} onChange={(event) => setPriceForm({ ...priceForm, leadTimeDays: Number(event.target.value) })} />
          <label className="field checkboxField">
            <span>Disponible</span>
            <input type="checkbox" checked={priceForm.available} onChange={(event) => setPriceForm({ ...priceForm, available: event.target.checked })} />
          </label>
        </div>
        <div className="actions"><Button onClick={saveSupplierPrice}>Guardar precio</Button></div>
      </section>

      <section className="panel fullPanel">
        <div className="panelHeader">
          <div>
            <h2 className="panelTitle">Catálogo y mejor proveedor</h2>
            <p className="panelText">Edita precios base, abre ingredientes para cambiarlos y revisa el proveedor recomendado por puntaje.</p>
          </div>
        </div>
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Ingrediente</th>
                <th>Categoría</th>
                <th>Precio base</th>
                <th>Mejor proveedor</th>
                <th>Puntaje</th>
                <th>Precio proveedor</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ingredient) => {
                const best = getBestSupplierPrice(ingredient);
                return (
                  <tr key={ingredient.id}>
                    <td><strong>{ingredient.name}</strong></td>
                    <td>{ingredient.category}</td>
                    <td>{formatCOP(ingredient.basePriceCOPPerKg ?? ingredient.composition.costCOPPerKg ?? 0)}</td>
                    <td>{best?.supplier?.name ?? "Sin proveedor"}</td>
                    <td>{best?.supplier?.totalScore ? `${best.supplier.totalScore}/100` : "-"}</td>
                    <td>{best ? formatCOP(best.priceCOPPerKg) : "-"}</td>
                    <td>
                      <div className="actions">
                        <Button variant="secondary" onClick={() => editIngredient(ingredient)}>Editar</Button>
                        <Button variant="danger" onClick={() => removeIngredient(ingredient.id)}>Eliminar</Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel fullPanel">
        <div className="panelHeader">
          <div>
            <h2 className="panelTitle">Proveedores registrados</h2>
            <p className="panelText">El puntaje total es el criterio principal para elegir el mejor proveedor.</p>
          </div>
        </div>
        <div className="cardsGrid">
          {suppliers.map((supplier) => (
            <article className="recipeCard" key={supplier.id}>
              <div className="panelHeader compactHeader">
                <div>
                  <h3>{supplier.name}</h3>
                  <p className="panelText">{supplier.contactName || "Sin contacto"} · {supplier.phone || "Sin teléfono"}</p>
                </div>
                <strong className="scorePill">{supplier.totalScore}/100</strong>
              </div>
              <div className="miniStats">
                <span><strong>{supplier.qualityScore}</strong><small>Calidad</small></span>
                <span><strong>{supplier.priceScore}</strong><small>Precio</small></span>
                <span><strong>{supplier.serviceScore}</strong><small>Servicio</small></span>
                <span><strong>{supplier.deliveryScore}</strong><small>Entrega</small></span>
              </div>
              <div className="actions">
                <Button variant="secondary" onClick={() => editSupplier(supplier)}>Editar</Button>
                <Button variant="danger" onClick={() => removeSupplier(supplier.id)}>Eliminar</Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <p className="footerNote">{message || "Los cambios en precios se reflejan en el costo de la receta cuando seleccionas el ingrediente en el constructor."}</p>
    </div>
  );
}
