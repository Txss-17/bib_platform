import { findSceneDefinition } from "@/lib/studioScenes";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SceneVariantPickerProps {
  sceneType: string;
  value: string;
  onChange: (variant: string) => void;
  disabled?: boolean;
}

function formatVariantLabel(variant: string) {
  return variant
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function SceneVariantPicker({
  sceneType,
  value,
  onChange,
  disabled = false,
}: SceneVariantPickerProps) {
  const definition = findSceneDefinition(sceneType);
  const variants = definition?.variants ?? [];

  if (variants.length === 0) {
    return null;
  }

  const currentValue = variants.includes(value) ? value : variants[0];

  return (
    <div className="space-y-2">
      <Label>Variante</Label>

      <Select
        value={currentValue}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder="Choisir une variante" />
        </SelectTrigger>

        <SelectContent>
          {variants.map((variant) => (
            <SelectItem key={variant} value={variant}>
              {formatVariantLabel(variant)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
