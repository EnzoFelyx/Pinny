import { Pencil } from 'lucide-react-native';
import { type AccessibilityActionEvent, Pressable, Text, TextInput, View } from 'react-native';

import { useInlineRename } from '@/hooks/useInlineRename';
import { ptBR } from '@/i18n/pt-BR';
import { colors } from '@/theme';

interface ColumnTitleProps {
  title: string;
  cardCount: number;
  // Sem ele, o título é só leitura (ex.: galeria de componentes).
  onRename?: (title: string) => void;
  onEditingChange?: (isEditing: boolean) => void;
}

const PENCIL_ICON_SIZE = 15;
const renameAction = [{ name: 'activate', label: ptBR.board.renameColumn }] as const;

// Lápis, nome e contagem da coluna (Figma "Título editável da coluna"). Tocar no lápis ou no nome
// edita ali mesmo: "OK" ou tocar fora salva, e nome vazio volta ao anterior.
export function ColumnTitle({ title, cardCount, onRename, onEditingChange }: ColumnTitleProps) {
  const { draft, changeDraft, startEditing, finishEditing } = useInlineRename({
    title,
    onRename,
    onEditingChange,
  });

  const handleAccessibilityAction = (event: AccessibilityActionEvent) => {
    if (event.nativeEvent.actionName === 'activate') startEditing();
  };

  const countBadge = (
    // Selo da contagem (Figma "Contagem"): cresce para os lados com 2 ou mais dígitos.
    <View className="h-[25px] min-w-[25px] items-center justify-center rounded-[9px] bg-surface px-1.5">
      <Text className="text-tag text-text-primary">{cardCount}</Text>
    </View>
  );

  if (draft !== null) {
    return (
      <View className="flex-1 flex-row items-center gap-2">
        <Pencil size={PENCIL_ICON_SIZE} color={colors.primary} />
        <TextInput
          value={draft}
          onChangeText={changeDraft}
          onBlur={finishEditing}
          autoFocus
          selectTextOnFocus
          returnKeyType="done"
          accessibilityLabel={ptBR.board.columnNameLabel}
          selectionColor={colors.primary}
          // Mesma altura do título: a borda roxa marca o foco sem o cabeçalho pular.
          className="-my-[5px] flex-1 rounded-[10px] border border-border-selected bg-surface px-2 py-1 text-subtitle text-text-primary"
        />
        {countBadge}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="header"
      accessibilityLabel={ptBR.board.columnSummary(title, cardCount)}
      accessibilityHint={onRename ? ptBR.board.renameColumnHint : undefined}
      accessibilityActions={onRename ? renameAction : undefined}
      onAccessibilityAction={handleAccessibilityAction}
      disabled={!onRename}
      onPress={startEditing}
      className="flex-1 flex-row items-center gap-2 active:opacity-60"
    >
      <Pencil size={PENCIL_ICON_SIZE} color={colors.textSecondary} />
      <Text numberOfLines={1} className="flex-1 text-subtitle text-text-primary">
        {title}
      </Text>
      {countBadge}
    </Pressable>
  );
}
