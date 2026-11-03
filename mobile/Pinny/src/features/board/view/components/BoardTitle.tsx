import { type AccessibilityActionEvent, Pressable, Text, TextInput, View } from 'react-native';

import type { useInlineRename } from '@/hooks/useInlineRename';
import { ptBR } from '@/i18n/pt-BR';
import { colors } from '@/theme';

const renameAction = [{ name: 'activate', label: ptBR.board.renameBoard }] as const;

interface BoardTitleProps {
  title: string;
  subtitle: string;
  // Estado da edição, no cabeçalho: o "Renomear quadro" do menu também começa a edição.
  rename: ReturnType<typeof useInlineRename>;
}

// Título e subtítulo do quadro. Tocar no nome edita ali mesmo, como no título da coluna.
export function BoardTitle({ title, subtitle, rename }: BoardTitleProps) {
  const { draft, canRename, changeDraft, startEditing, finishEditing } = rename;

  const handleAccessibilityAction = (event: AccessibilityActionEvent) => {
    if (event.nativeEvent.actionName === 'activate') startEditing();
  };

  return (
    <View className="flex-1 gap-[3px]">
      {draft !== null ? (
        <TextInput
          value={draft}
          onChangeText={changeDraft}
          onBlur={finishEditing}
          autoFocus
          selectTextOnFocus
          returnKeyType="done"
          accessibilityLabel={ptBR.board.boardNameLabel}
          selectionColor={colors.primary}
          // Margens negativas do tamanho do recuo e da borda: o texto fica no mesmo lugar do título
          // e o cabeçalho não pula.
          className="-mx-[9px] -my-[5px] rounded-[10px] border border-border-selected bg-surface px-2 py-1 text-header-title text-text-primary"
        />
      ) : (
        <Pressable
          accessibilityRole="header"
          accessibilityLabel={title}
          accessibilityHint={canRename ? ptBR.board.renameBoardHint : undefined}
          accessibilityActions={canRename ? renameAction : undefined}
          onAccessibilityAction={handleAccessibilityAction}
          disabled={!canRename}
          onPress={startEditing}
          className="active:opacity-60"
        >
          <Text numberOfLines={1} className="text-header-title text-text-primary">
            {title}
          </Text>
        </Pressable>
      )}
      <Text numberOfLines={1} className="text-body text-text-secondary">
        {subtitle}
      </Text>
    </View>
  );
}
