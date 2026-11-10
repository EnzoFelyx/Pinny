import { Check, Clock3, ListChecks, type LucideIcon } from 'lucide-react-native';
import { memo } from 'react';
import {
  type AccessibilityActionEvent,
  type AccessibilityActionInfo,
  Image,
  type ImageSourcePropType,
  Pressable,
  Text,
  View,
} from 'react-native';

import type { DeadlineStatus, LabelColor, Priority } from '@/features/card/model/card.types';
import { colors } from '@/theme';
import type { TextPart } from '@/utils/text';

import { Chip, type ChipEmphasis } from './Chip';
import { Label } from './Label';
import { PriorityChip } from './PriorityChip';
import { SelectionCheck } from './SelectionCheck';

export interface CardLabel {
  id: string;
  name: string;
  color: LabelColor;
}

export interface CardDeadline {
  // Texto pronto do ViewModel, sempre com o estado escrito (ex.: "17 mai · Atrasado").
  text: string;
  status: DeadlineStatus;
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
  // Alternativas ao gesto para o leitor de tela (ex.: "Mover para cima" no quadro).
  accessibilityActions?: readonly AccessibilityActionInfo[];
  onAccessibilityAction?: (event: AccessibilityActionEvent) => void;
  // Modo de seleção: círculo no canto e, marcado, fundo lavanda com a borda roxa. O toque
  // (onPress) marca/desmarca. undefined = fora do modo.
  isSelected?: boolean;
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

const deadlineStyle: Record<
  DeadlineStatus,
  { tone: LabelColor; icon: LucideIcon; emphasis: ChipEmphasis }
> = {
  normal: { tone: 'babyBlue', icon: Clock3, emphasis: 'default' },
  soon: { tone: 'butter', icon: Clock3, emphasis: 'default' },
  overdue: { tone: 'peach', icon: Clock3, emphasis: 'alert' },
  done: { tone: 'mint', icon: Check, emphasis: 'default' },
};

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
  accessibilityActions,
  onAccessibilityAction,
  isSelected,
}: CardProps) {
  const isSelecting = isSelected !== undefined;
  const surface: CardSurface = isSelecting ? (isSelected ? 'selected' : 'unselected') : 'default';
  const hasTags = labels.length > 0 || priority !== undefined;
  const hasMeta = deadline !== undefined || checklistText !== undefined;

  return (
    <Pressable
      accessibilityRole={isSelecting ? 'checkbox' : 'button'}
      accessibilityState={isSelecting ? { checked: isSelected } : undefined}
      accessibilityLabel={accessibilityLabel}
      // Selecionando, o toque só marca: as ações de mover voltam ao sair do modo.
      accessibilityActions={isSelecting ? undefined : accessibilityActions}
      onAccessibilityAction={isSelecting ? undefined : onAccessibilityAction}
      onPress={onPress}
      onLongPress={onLongPress}
      className={`w-full gap-2 rounded-[18px] border-2 p-3 shadow-card ${surfaceClass[surface]}`}
    >
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
          {deadline ? <Chip label={deadline.text} {...deadlineStyle[deadline.status]} /> : <View />}
          {checklistText ? (
            <View className="flex-row items-center gap-1">
              <ListChecks size={META_ICON_SIZE} color={colors.textSecondary} />
              <Text className="text-meta text-text-secondary">{checklistText}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {isSelecting ? (
        <SelectionCheck isSelected={isSelected === true} className="right-2.5 top-2.5" />
      ) : null}
    </Pressable>
  );
});
