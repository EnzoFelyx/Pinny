import { Check, Clock3, ListChecks, type LucideIcon } from 'lucide-react-native';
import { memo } from 'react';
import { Image, type ImageSourcePropType, Pressable, Text, View } from 'react-native';

import type { DeadlineStatus, LabelColor, Priority } from '@/features/card/model/card.types';
import { colors } from '@/theme';

import { Chip, type ChipEmphasis } from './Chip';
import { Label } from './Label';
import { PriorityChip } from './PriorityChip';

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
}

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
  accessibilityLabel,
  labels = [],
  priority,
  deadline,
  checklistText,
  thumbnail,
  onPress,
  onLongPress,
}: CardProps) {
  const hasTags = labels.length > 0 || priority !== undefined;
  const hasMeta = deadline !== undefined || checklistText !== undefined;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      onLongPress={onLongPress}
      // Enquanto o dedo está no cartão, a borda aparece; ao soltar, some.
      className="w-full gap-2 rounded-[18px] border-2 border-transparent bg-surface p-3 shadow-card active:border-border-selected"
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

      <Text className="text-card-title text-text-primary">{title}</Text>

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
    </Pressable>
  );
});
