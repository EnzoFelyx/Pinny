import { ListChecks } from 'lucide-react-native';
import { memo, type ReactNode } from 'react';
import {
  type AccessibilityActionEvent,
  type AccessibilityActionInfo,
  Image,
  type ImageSourcePropType,
  Pressable,
  Text,
  View,
} from 'react-native';

import type { LabelColor, Priority } from '@/features/card/model/card.types';
import { colors } from '@/theme';
import type { TextPart } from '@/utils/text';

import { type CardDeadline, DeadlineChip } from './DeadlineChip';
import { Label } from './Label';

import { PriorityChip } from './PriorityChip';
import { SelectionCheck } from './SelectionCheck';

export type { CardDeadline } from './DeadlineChip';

export interface CardLabel {
  id: string;
  name: string;
  color: LabelColor;
}

interface CardProps {
  title: string;
  // Título dividido pela busca: os trechos achados ganham o marca-texto lavanda.
  titleParts?: readonly TextPart[];
  // Leitura completa do cartão, montada pelo ViewModel (CLAUDE.md, regra 13).
  accessibilityLabel: string;
  labels?: readonly CardLabel[];
  priority?: Priority;
  deadline?: CardDeadline;
  checklistText?: string;
  // Foto opcional (anexo do cartão). Aceita arquivo local ou { uri }.
  thumbnail?: ImageSourcePropType;
  onPress?: () => void;
  onLongPress?: () => void;
  // O que o toque faz, para o leitor de tela (ex.: "Abre o cartão").
  accessibilityHint?: string;
  // Alternativas ao gesto para o leitor de tela (ex.: "Mover para cima" no quadro).
  accessibilityActions?: readonly AccessibilityActionInfo[];
  onAccessibilityAction?: (event: AccessibilityActionEvent) => void;
  // Modo de seleção: círculo no canto e, marcado, fundo lavanda com a borda roxa. O toque
  // (onPress) marca/desmarca. undefined = fora do modo.
  isSelected?: boolean;
  // Esconde só a bolinha do modo de seleção (ex.: durante o arraste em lote).
  isCheckHidden?: boolean;
  // Seleção desenhada por fora, na UI thread (quadro): só o leitor de tela recebe o estado, sem o
  // visual do isSelected. undefined = fora do modo (ou leitor de tela desligado).
  accessibilitySelected?: boolean;
  // Camadas desenhadas por fora (ex.: seleção animada do quadro): background fica atrás do
  // conteúdo e overlay por cima, as duas no lugar do cartão.
  background?: ReactNode;
  overlay?: ReactNode;
}

type CardSurface = 'default' | 'unselected' | 'selected';

// Todos têm a borda de 2 (transparente quando não aparece), para o tamanho não mudar.
const surfaceClass: Record<CardSurface, string> = {
  // Enquanto o dedo está no cartão, a borda aparece; ao soltar, some.
  default: 'border-transparent bg-surface active:border-border-selected',
  unselected: 'border-transparent bg-surface',
  selected: 'border-primary bg-secondary',
};

const META_ICON_SIZE = 14;
// Lugar da bolinha de seleção no cartão (também usado pela seleção animada do quadro).
export const CARD_CHECK_POSITION = 'right-2.5 top-2.5';

// Post-it do quadro. Memoizado porque vive em listas longas.
export const Card = memo(function Card({
  title,
  titleParts,
  accessibilityLabel,
  labels = [],
  priority,
  deadline,
  checklistText,
  thumbnail,
  onPress,
  onLongPress,
  accessibilityHint,
  accessibilityActions,
  onAccessibilityAction,
  isSelected,
  isCheckHidden = false,
  accessibilitySelected,
  background,
  overlay,
}: CardProps) {
  const isSelecting = isSelected !== undefined;
  const checked = isSelected ?? accessibilitySelected;
  const isCheckable = checked !== undefined;
  const surface: CardSurface = isSelecting ? (isSelected ? 'selected' : 'unselected') : 'default';
  const hasTags = labels.length > 0 || priority !== undefined;
  const hasMeta = deadline !== undefined || checklistText !== undefined;

  return (
    <Pressable
      accessibilityRole={isCheckable ? 'checkbox' : 'button'}
      accessibilityState={isCheckable ? { checked } : undefined}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={isCheckable ? undefined : accessibilityHint}
      // Selecionando, o toque só marca: as ações de mover voltam ao sair do modo.
      accessibilityActions={isCheckable ? undefined : accessibilityActions}
      onAccessibilityAction={isCheckable ? undefined : onAccessibilityAction}
      onPress={onPress}
      onLongPress={onLongPress}
      className={`w-full gap-2 rounded-[18px] border-2 p-3 shadow-card ${surfaceClass[surface]}`}
    >
      {background}
      {thumbnail ? (
        <Image source={thumbnail} resizeMode="cover" className="h-14 w-full rounded-[12px]" />
      ) : null}

      {hasTags ? (
        <View className="flex-row flex-wrap items-center gap-1.5">
          {labels.map((label) => (
            <Label key={label.id} name={label.name} color={label.color} />
          ))}
          {priority ? <PriorityChip priority={priority} /> : null}
        </View>
      ) : null}

      <Text className="text-card-title text-text-primary">
        {titleParts
          ? titleParts.map((part, index) =>
              part.isMatch ? (
                // A ordem dos trechos não muda enquanto o termo é o mesmo: o índice basta de chave.
                <Text key={index} className="bg-search-highlight">
                  {part.text}
                </Text>
              ) : (
                part.text
              ),
            )
          : title}
      </Text>

      {hasMeta ? (
        <View className="flex-row items-center justify-between">
          {deadline ? <DeadlineChip deadline={deadline} /> : <View />}
          {checklistText ? (
            <View className="flex-row items-center gap-1">
              <ListChecks size={META_ICON_SIZE} color={colors.textSecondary} />
              <Text className="text-meta text-text-secondary">{checklistText}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {isSelecting && !isCheckHidden ? (
        <SelectionCheck isSelected={isSelected === true} className={CARD_CHECK_POSITION} />
      ) : null}
      {overlay}
    </Pressable>
  );
});
