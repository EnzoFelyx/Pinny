import { Pressable, Text, View } from 'react-native';

import { PriorityChip } from '@/components/PriorityChip';
import type { Priority } from '@/features/card/model/card.types';

export interface PriorityOption {
  // null = sem prioridade.
  value: Priority | null;
  accessibilityLabel: string;
  isSelected: boolean;
}

interface PriorityPickerProps {
  options: readonly PriorityOption[];
  onChange: (priority: Priority | null) => void;
  noneLabel: string;
  accessibilityLabel: string;
}

// Escolha única da prioridade do cartão: os mesmos chips do quadro, e a escolhida ganha o anel
// roxo em volta (forma, não só cor; CLAUDE.md, regra 14). "Nenhuma" tira a prioridade.
export function PriorityPicker({
  options,
  onChange,
  noneLabel,
  accessibilityLabel,
}: PriorityPickerProps) {
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      className="flex-row flex-wrap gap-2"
    >
      {options.map((option) => (
        <Pressable
          key={option.value ?? 'none'}
          accessibilityRole="radio"
          accessibilityLabel={option.accessibilityLabel}
          accessibilityState={{ checked: option.isSelected }}
          onPress={() => onChange(option.value)}
          className={`rounded-[15px] border-2 p-0.5 active:opacity-60 ${
            option.isSelected ? 'border-primary' : 'border-transparent'
          }`}
        >
          {option.value ? (
            <PriorityChip priority={option.value} />
          ) : (
            // Mesmo tamanho e forma dos chips de prioridade (Chip), sem ícone.
            <View className="rounded-[12px] bg-column-background px-[9px] py-[5px]">
              <Text className="text-tag text-text-primary">{noneLabel}</Text>
            </View>
          )}
        </Pressable>
      ))}
    </View>
  );
}
