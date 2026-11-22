import { Text, View } from 'react-native';

interface CountBadgeProps {
  count: number;
}

// Selo da contagem (Figma "Contagem"), ao lado do nome da coluna ou da seção: cresce para os lados
// com 2 ou mais dígitos. O leitor de tela lê a contagem pelo rótulo do título.
export function CountBadge({ count }: CountBadgeProps) {
  return (
    <View className="h-[25px] min-w-[25px] items-center justify-center rounded-[9px] bg-surface px-1.5">
      <Text className="text-tag text-text-primary">{count}</Text>
    </View>
  );
}
