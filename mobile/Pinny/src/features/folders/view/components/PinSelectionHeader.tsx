import { Pressable, Text, View } from 'react-native';

import { ptBR } from '@/i18n/pt-BR';

const text = ptBR.folders.folderScreen;

interface PinSelectionHeaderProps {
  title: string;
  onCancel: () => void;
  onDone: () => void;
}

// Topo da tela da pasta no modo "Fixar quadros", como na seleção de fotos do iOS: quantos estão
// escolhidos e, à direita, "Cancelar" e "Pronto". Substitui o voltar e o "…" enquanto escolhe.
export function PinSelectionHeader({ title, onCancel, onDone }: PinSelectionHeaderProps) {
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
        <Pressable
          accessibilityRole="button"
          onPress={onDone}
          className="min-h-11 justify-center rounded-full bg-primary px-4 active:opacity-80"
        >
          <Text className="text-card-title text-text-on-primary">{text.done}</Text>
        </Pressable>
      </View>
      <Text className="text-body text-text-secondary">{text.pinSelectionHint}</Text>
    </View>
  );
}
