import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { StickyNoteIllustration } from './StickyNoteIllustration';

interface EmptyStateProps {
  message: string;
  action?: ReactNode;
}

export function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <View className="w-full items-center gap-[18px]">
      <StickyNoteIllustration />
      <Text className="text-center text-body text-text-secondary">{message}</Text>
      {action}
    </View>
  );
}
