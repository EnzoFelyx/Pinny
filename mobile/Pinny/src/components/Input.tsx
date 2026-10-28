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
}

const ICON_SIZE = 19;

export function Input({ label, icon: Icon, ...inputProps }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    // A moldura existe sempre (transparente) para o layout não pular ao focar.
    <View
      className={`w-full rounded-[18px] border-2 p-1 ${
        isFocused ? 'border-border-selected' : 'border-transparent'
      }`}
    >
      <View className="gap-2">
        <Text className="text-label text-text-primary">{label}</Text>
        <View className="min-h-[52px] flex-row items-center gap-[10px] rounded-[18px] border border-border-strong bg-surface px-[14px]">
          {Icon ? <Icon size={ICON_SIZE} color={colors.textSecondary} /> : null}
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
    </View>
  );
}
