import type { LucideIcon } from 'lucide-react-native';
import { Text } from 'react-native';

import { Button } from './Button';
import { Input } from './Input';
import { SheetLayout } from './SheetLayout';

interface NameSheetProps {
  title: string;
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
    <SheetLayout title={title}>
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
