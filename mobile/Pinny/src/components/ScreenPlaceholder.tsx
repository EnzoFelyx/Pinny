import type { ReactNode } from 'react';
import { ScrollView, Text } from 'react-native';

import { ptBR } from '@/i18n/pt-BR';

import { EmptyState } from './EmptyState';

interface ScreenPlaceholderProps {
  title: string;
  children?: ReactNode;
}

// Esqueleto de tela ainda não construída (etapa 5): título e um aviso amigável.
export function ScreenPlaceholder({ title, children }: ScreenPlaceholderProps) {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      className="flex-1 bg-background"
      contentContainerClassName="gap-8 px-6 pb-8 pt-2"
    >
      <Text accessibilityRole="header" className="text-hero text-text-primary">
        {title}
      </Text>
      <EmptyState message={ptBR.common.comingSoon} />
      {children}
    </ScrollView>
  );
}
