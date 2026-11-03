import { Pressable, Text } from 'react-native';

interface MoreBoardsTileProps {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
}

// "+N quadros" no lugar dos quadros que não cabem na Início: abre a tela da pasta.
export function MoreBoardsTile({ label, accessibilityLabel, onPress }: MoreBoardsTileProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className="h-[58px] flex-1 items-center justify-center rounded-[12px] bg-column-background active:opacity-70"
    >
      <Text className="text-tag text-text-primary">{label}</Text>
    </Pressable>
  );
}
