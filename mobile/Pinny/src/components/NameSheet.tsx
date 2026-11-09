import type { LucideIcon } from 'lucide-react-native';
import { Text } from 'react-native';

import { Button } from './Button';
import { Input } from './Input';
import { SheetLayout } from './SheetLayout';

interface NameSheetProps {
  title: string;
  // Aviso logo abaixo do título (ex.: o cartão que vai para a coluna nova).
  description?: string;
  label: string;
  icon: LucideIcon;
  placeholder: string;
  submitLabel: string;
  // Nota discreta abaixo do botão (Figma: "Depois você pode mudar o nome.").
  hint?: string;
  name: string;
  canSubmit: boolean;
  errorText: string | null;
  onChangeName: (name: string) => void;
  onSubmit: () => void;
}

// Folha com um campo de nome e o botão de confirmar (Figma "Bottom sheet / Nova pasta"). Usada
// para criar e renomear pastas e colunas.
export function NameSheet({
  title,
  description,
  label,
  icon,
  placeholder,
  submitLabel,
  hint,
  name,
  canSubmit,
  errorText,
  onChangeName,
  onSubmit,
}: NameSheetProps) {
  return (
    // ~100px (32pt) entre o último item (botão ou nota) e a borda de baixo (decisão do autor).
    <SheetLayout title={title} bottomSpace="roomy">
      {description ? <Text className="text-body text-text-secondary">{description}</Text> : null}
      <Input
        label={label}
        icon={icon}
        placeholder={placeholder}
        value={name}
        onChangeText={onChangeName}
        returnKeyType="done"
        onSubmitEditing={onSubmit}
        autoFocus
      />
      {errorText ? (
        <Text accessibilityLiveRegion="polite" className="text-body text-alert">
          {errorText}
        </Text>
      ) : null}
      <Button label={submitLabel} disabled={!canSubmit} onPress={onSubmit} />
      {hint ? <Text className="text-caption text-text-secondary">{hint}</Text> : null}
    </SheetLayout>
  );
}
