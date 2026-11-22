import { Check } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import type { LabelColor } from '@/features/card/model/card.types';
import { colors } from '@/theme';

import { labelToneClass } from './Chip';

const CHECK_SIZE = 16;
// O círculo tem 36; o hitSlop completa a área de toque de 44.
const TOUCH_SLOP = 4;

interface ColorSwatchPickerProps {
  options: readonly LabelColor[];
  value: LabelColor;
  onChange: (color: LabelColor) => void;
  // Nome de cada cor para o leitor de tela (ex.: "Lavanda").
  colorLabels: Readonly<Record<LabelColor, string>>;
  accessibilityLabel: string;
}

// Escolha de uma cor entre os acentos pastéis (ex.: nova etiqueta). A escolhida tem a borda roxa
// e o visto, não só a cor (CLAUDE.md, regra 14).
export function ColorSwatchPicker({
  options,
  value,
  onChange,
  colorLabels,
  accessibilityLabel,
}: ColorSwatchPickerProps) {
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      className="flex-row gap-3"
    >
      {options.map((color) => {
        const isSelected = color === value;
        return (
          <Pressable
            key={color}
            accessibilityRole="radio"
            accessibilityLabel={colorLabels[color]}
            accessibilityState={{ checked: isSelected }}
            hitSlop={TOUCH_SLOP}
            onPress={() => onChange(color)}
            className={`h-9 w-9 items-center justify-center rounded-full border-2 active:opacity-60 ${
              labelToneClass[color]
            } ${isSelected ? 'border-primary' : 'border-transparent'}`}
          >
            {isSelected ? <Check size={CHECK_SIZE} color={colors.primary} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}
