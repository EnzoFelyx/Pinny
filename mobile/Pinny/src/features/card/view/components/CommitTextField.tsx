import { useState } from 'react';
import { TextInput, type TextInputProps } from 'react-native';

import { colors } from '@/theme';

interface CommitTextFieldProps extends Pick<
  TextInputProps,
  'placeholder' | 'accessibilityLabel' | 'className' | 'multiline'
> {
  // Valor gravado (vem do banco).
  value: string;
  // Chamado ao sair do campo, só quando o texto mudou.
  onCommit: (text: string) => void;
  // Texto vazio não é aceito: ao sair, volta ao gravado (ex.: título).
  isRequired?: boolean;
}

// Campo do detalhe que grava ao sair (sem botão "Salvar"). Enquanto o usuário digita, o texto é
// só dele; quando não está editando, mostra sempre o que está gravado (inclusive depois de um
// desfazer feito em outro lugar).
export function CommitTextField({
  value,
  onCommit,
  isRequired = false,
  multiline = false,
  ...inputProps
}: CommitTextFieldProps) {
  const [draft, setDraft] = useState<string | null>(null);

  const commit = () => {
    const next = draft;
    setDraft(null);
    if (next === null || next === value) return;
    if (isRequired && next.trim().length === 0) return;
    onCommit(next);
  };

  return (
    <TextInput
      {...inputProps}
      value={draft ?? value}
      onChangeText={setDraft}
      onFocus={() => setDraft(value)}
      onBlur={commit}
      multiline={multiline}
      // Título: "OK" do teclado termina a edição (multiline, mas sem quebra de linha).
      submitBehavior={multiline && isRequired ? 'blurAndSubmit' : undefined}
      returnKeyType={isRequired ? 'done' : 'default'}
      placeholderTextColor={colors.textSecondary}
      selectionColor={colors.primary}
    />
  );
}
