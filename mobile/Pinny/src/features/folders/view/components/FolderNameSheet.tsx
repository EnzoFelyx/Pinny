import { FolderPlus } from 'lucide-react-native';
import { Text } from 'react-native';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { SheetLayout } from '@/components/SheetLayout';
import { ptBR } from '@/i18n/pt-BR';

const text = ptBR.folders;

interface FolderNameSheetProps {
  title: string;
  submitLabel: string;
  name: string;
  canSubmit: boolean;
  errorText: string | null;
  onChangeName: (name: string) => void;
  onSubmit: () => void;
}

// Formulário de nome de pasta, usado pelas folhas "Nova pasta" e "Renomear pasta".
export function FolderNameSheet({
  title,
  submitLabel,
  name,
  canSubmit,
  errorText,
  onChangeName,
  onSubmit,
}: FolderNameSheetProps) {
  return (
    <SheetLayout title={title}>
      <Input
        label={text.folderNameLabel}
        icon={FolderPlus}
        placeholder={text.folderNamePlaceholder}
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
    </SheetLayout>
  );
}
