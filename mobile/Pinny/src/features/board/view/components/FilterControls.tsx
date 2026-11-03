import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Checkbox } from '@/components/Checkbox';
import { Toggle } from '@/components/Toggle';

// Peças do modal "Filtrar" (Figma "Filter panel open").

interface FilterSectionProps {
  title: string;
  children: ReactNode;
}

export function FilterSection({ title, children }: FilterSectionProps) {
  return (
    <View className="gap-2">
      <Text accessibilityRole="header" className="text-card-title text-text-primary">
        {title}
      </Text>
      {children}
    </View>
  );
}

interface RadioChoiceProps {
  label: string;
  isSelected: boolean;
  onSelect: () => void;
}

// Opção de escolha única (prazo): pílula com o círculo de seleção e o texto. Selecionada, ganha o
// fundo lavanda e o ponto no círculo (não depende só da cor).
export function RadioChoice({ label, isSelected, onSelect }: RadioChoiceProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected: isSelected }}
      onPress={onSelect}
      className={`h-9 flex-row items-center gap-1.5 rounded-[12px] px-2.5 active:opacity-70 ${
        isSelected ? 'bg-lavender' : 'bg-background'
      }`}
    >
      <View
        className={`h-[18px] w-[18px] items-center justify-center rounded-full border-[1.5px] ${
          isSelected ? 'border-primary' : 'border-border-strong'
        }`}
      >
        {isSelected ? <View className="h-2 w-2 rounded-full bg-primary" /> : null}
      </View>
      <Text className="text-label text-text-primary">{label}</Text>
    </Pressable>
  );
}

interface CheckChoiceProps {
  accessibilityLabel: string;
  isSelected: boolean;
  onToggle: () => void;
  // O chip ao lado da caixa (prioridade ou etiqueta); tocar nele também marca.
  children: ReactNode;
}

// Opção de seleção múltipla: caixa de marcar e o chip.
export function CheckChoice({
  accessibilityLabel,
  isSelected,
  onToggle,
  children,
}: CheckChoiceProps) {
  return (
    <Pressable accessible={false} onPress={onToggle} className="h-9 flex-row items-center gap-1.5">
      <Checkbox checked={isSelected} onToggle={onToggle} accessibilityLabel={accessibilityLabel} />
      <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        {children}
      </View>
    </Pressable>
  );
}

interface ToggleOptionProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function ToggleOption({ label, value, onValueChange }: ToggleOptionProps) {
  return (
    <View className="h-10 flex-row items-center justify-between">
      <Text className="text-label text-text-primary">{label}</Text>
      <Toggle value={value} onValueChange={onValueChange} accessibilityLabel={label} />
    </View>
  );
}
