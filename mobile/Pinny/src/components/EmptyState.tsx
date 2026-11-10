import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { type IllustrationVariant, StickyNoteIllustration } from './StickyNoteIllustration';

interface EmptyStateProps {
  message: string;
  action?: ReactNode;
  illustrationVariant?: IllustrationVariant;
}

export function EmptyState({ message, action, illustrationVariant }: EmptyStateProps) {
  return (
    <View className="w-full items-center gap-[18px]">
      <StickyNoteIllustration variant={illustrationVariant} />
      <Text className="text-center text-body text-text-secondary">{message}</Text>
      {action}
    </View>
  );
}
