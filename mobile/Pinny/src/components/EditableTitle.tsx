import { type AccessibilityActionEvent, Pressable, Text, TextInput, View } from 'react-native';

import type { useInlineRename } from '@/hooks/useInlineRename';
import { colors } from '@/theme';

interface EditableTitleProps {
  title: string;
  subtitle: string;
  // Estado da edição, no cabeçalho: o "Renomear" do menu também começa a edição.
  rename: ReturnType<typeof useInlineRename>;
  // Textos do leitor de tela: ação ("Renomear quadro"), dica e nome do campo.
  renameActionLabel: string;
  renameHint: string;
  inputLabel: string;
  // Toque no título faz outra coisa em vez de editar ali mesmo (ex.: pasta abre "Personalizar").
  onPress?: () => void;
}

// Título e subtítulo do topo de uma tela (quadro, pasta). Tocar no nome edita ali mesmo, como
// no título da coluna.
export function EditableTitle({
  title,
  subtitle,
  rename,
  renameActionLabel,
  renameHint,
  inputLabel,
  onPress,
}: EditableTitleProps) {
  const { draft, canRename, changeDraft, startEditing, finishEditing } = rename;
  const renameAction = [{ name: 'activate', label: renameActionLabel }];
  // O que o toque no título faz: a ação da tela ou editar ali mesmo (sem nenhuma, só leitura).
  const pressAction = onPress ?? (canRename ? startEditing : undefined);

  const handleAccessibilityAction = (event: AccessibilityActionEvent) => {
    if (event.nativeEvent.actionName === 'activate') pressAction?.();
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
          accessibilityLabel={inputLabel}
          selectionColor={colors.primary}
          // Margens negativas do tamanho do recuo e da borda: o texto fica no mesmo lugar do título
          // e o cabeçalho não pula.
          className="-mx-[9px] -my-[5px] rounded-[10px] border border-border-selected bg-surface px-2 py-1 text-header-title text-text-primary"
        />
      ) : (
        <Pressable
          accessibilityRole="header"
          accessibilityLabel={title}
          accessibilityHint={pressAction ? renameHint : undefined}
          accessibilityActions={pressAction ? renameAction : undefined}
          onAccessibilityAction={handleAccessibilityAction}
          disabled={!pressAction}
          onPress={pressAction}
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
