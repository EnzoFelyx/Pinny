import { Check } from 'lucide-react-native';
import { Pressable } from 'react-native';

import { colors } from '@/theme';

interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  accessibilityLabel: string;
}

const ICON_SIZE = 15;
const ICON_STROKE = 3;
// A caixa tem 22pt; o hitSlop leva a área de toque para 44pt.
const HIT_SLOP = 11;

export function Checkbox({ checked, onToggle, accessibilityLabel }: CheckboxProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked }}
      hitSlop={HIT_SLOP}
      onPress={onToggle}
      className={`h-[22px] w-[22px] items-center justify-center rounded-[7px] border-[1.5px] ${
        checked ? 'border-primary bg-primary' : 'border-border-strong bg-surface'
      }`}
    >
      {checked ? (
        <Check size={ICON_SIZE} color={colors.textOnPrimary} strokeWidth={ICON_STROKE} />
      ) : null}
    </Pressable>
  );
}
