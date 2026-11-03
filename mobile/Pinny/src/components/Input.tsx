import type { LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors } from '@/theme';

type NativeInputProps = Pick<
  TextInputProps,
  'value' | 'onChangeText' | 'placeholder' | 'autoFocus' | 'returnKeyType' | 'onSubmitEditing'
>;

interface InputProps extends NativeInputProps {
  label: string;
  icon?: LucideIcon;
  // Esconde o rótulo da tela (ex.: busca); o leitor de tela continua lendo.
  isLabelHidden?: boolean;
}

const ICON_SIZE = 19;

// Campo com rótulo e ícone. Em foco, a borda do campo e o ícone ficam em primary (a borda tem a
// mesma espessura nos dois estados, para o layout não pular).
export function Input({ label, icon: Icon, isLabelHidden = false, ...inputProps }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="w-full gap-2">
      {isLabelHidden ? null : <Text className="text-label text-text-primary">{label}</Text>}
      <View
        className={`min-h-[52px] flex-row items-center gap-[10px] rounded-[18px] border bg-surface px-[14px] ${
          isFocused ? 'border-border-selected' : 'border-border-strong'
        }`}
      >
        {Icon ? (
          <Icon size={ICON_SIZE} color={isFocused ? colors.primary : colors.textSecondary} />
        ) : null}
        <TextInput
          {...inputProps}
          accessibilityLabel={label}
          placeholderTextColor={colors.textSecondary}
          selectionColor={colors.primary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="flex-1 py-[14px] text-body text-text-primary"
        />
      </View>
    </View>
  );
}
