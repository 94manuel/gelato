import { DEFAULT_INGREDIENTS, NeutralComponentInput } from "@gelato/gelato-core";
import { Button } from "../atoms/Button";

interface Props {
  component: NeutralComponentInput;
  onChange: (next: NeutralComponentInput) => void;
  onRemove: () => void;
}

export function NeutralComponentRow({ component, onChange, onRemove }: Props) {
  return (
    <tr>
      <td>
        <input className="input" value={component.name} onChange={(event) => onChange({ ...component, name: event.target.value })} />
      </td>
      <td>
        <input className="input" type="number" min={0} value={component.grams} onChange={(event) => onChange({ ...component, grams: Number(event.target.value) })} />
      </td>
      <td>
        <select className="select" value={component.role} onChange={(event) => onChange({ ...component, role: event.target.value as NeutralComponentInput["role"] })}>
          <option value="carrier">Portador</option>
          <option value="stabilizer">Estabilizante</option>
          <option value="emulsifier">Emulsificante</option>
          <option value="fiber">Fibra</option>
          <option value="other">Otro</option>
        </select>
      </td>
      <td>
        <select
          className="select"
          value={component.name}
          onChange={(event) => {
            const found = DEFAULT_INGREDIENTS.find((item) => item.name === event.target.value);
            if (found) onChange({ ...component, name: found.name, composition: found.composition });
          }}
        >
          {DEFAULT_INGREDIENTS.map((ingredient) => <option key={ingredient.id} value={ingredient.name}>{ingredient.name}</option>)}
        </select>
      </td>
      <td><Button variant="danger" onClick={onRemove}>Quitar</Button></td>
    </tr>
  );
}
