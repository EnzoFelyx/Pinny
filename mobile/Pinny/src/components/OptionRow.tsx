import { Check } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, Text } from 'react-native';

import { colors } from '@/theme';

export type OptionRowSize = 'regular' | 'large';

interface OptionRowProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  // large = fonte e linha maiores (ex.: pastas da folha "Mover quadro").
  size?: OptionRowSize;
  // Escolha múltipla (ex.: etiquetas do cartão): caixa de seleção em vez de rádio.
  isMultiple?: boolean;
  // Conteúdo próprio no lugar do texto (ex.: o chip colorido da etiqueta). O label continua
  // sendo o que o leitor de tela lê.
  content?: ReactNode;
}

const rowClass: Record<OptionRowSize, string> = {
  regular: 'min-h-11 rounded-[14px] px-4 py-2.5',
  large: 'min-h-14 rounded-[16px] px-4 py-3.5',
};

const labelClass: Record<OptionRowSize, string> = {
  regular: 'text-body',
  large: 'text-card-title',
};

const CHECK_SIZE: Record<OptionRowSize, number> = { regular: 20, large: 22 };

// Opção de uma lista (rádio ou, com isMultiple, caixa de seleção): o selecionado tem fundo e ícone
// de visto, não só cor (CLAUDE.md, regra 14).
export function OptionRow({
  label,
  isSelected,
  onPress,
  size = 'regular',
  isMultiple = false,
  content,
}: OptionRowProps) {
  return (
    <Pressable
      accessibilityRole={isMultiple ? 'checkbox' : 'radio'}
      accessibilityLabel={content ? label : undefined}
      accessibilityState={{ checked: isSelected }}
      onPress={onPress}
      className={`flex-row items-center justify-between active:opacity-60 ${rowClass[size]} ${
        isSelected ? 'bg-secondary' : 'bg-transparent'
      }`}
    >
      {content ?? (
        <Text numberOfLines={1} className={`shrink text-text-primary ${labelClass[size]}`}>
          {label}
        </Text>
      )}
      {isSelected ? <Check size={CHECK_SIZE[size]} color={colors.onSecondary} /> : null}
    </Pressable>
  );
}
