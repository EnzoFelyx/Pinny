import { Pressable, Text, View } from 'react-native';

import { ptBR } from '@/i18n/pt-BR';

const text = ptBR.folders.folderScreen;

interface SelectionHeaderProps {
  title: string;
  hint: string;
  onCancel: () => void;
}

// Topo da tela da pasta no modo "Selecionar", como na seleção de fotos do iOS: quantos estão
// escolhidos, uma dica (ou o porquê de "Fixar" estar desativado) e "Cancelar" à direita.
// Substitui o voltar e o "…" enquanto seleciona; as ações ficam na barra de baixo.
export function SelectionHeader({ title, hint, onCancel }: SelectionHeaderProps) {
  return (
    <View className="gap-1 px-6 pb-6 pt-4">
      <View className="min-h-11 flex-row items-center gap-4">
        <Text
          accessibilityRole="header"
          accessibilityLiveRegion="polite"
          numberOfLines={1}
          className="flex-1 text-header-title text-text-primary"
        >
          {title}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={onCancel}
          className="min-h-11 justify-center active:opacity-60"
        >
          <Text className="text-card-title text-on-secondary">{text.cancel}</Text>
        </Pressable>
      </View>
      <Text accessibilityLiveRegion="polite" className="text-body text-text-secondary">
        {hint}
      </Text>
    </View>
  );
}
