import { Ellipsis, Plus } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ptBR } from '@/i18n/pt-BR';
import { colors } from '@/theme';

import { Button } from './Button';
import { EmptyState } from './EmptyState';

interface ColumnProps {
  title: string;
  cardCount: number;
  onAddCard: () => void;
  onOpenMenu: () => void;
  // Lista de cartões. Na etapa 6 vira a lista virtualizada com arraste.
  children?: ReactNode;
}

const MENU_ICON_SIZE = 18;

// Todas as colunas têm a mesma cor neutra (sem cor por coluna na v1).
export function Column({ title, cardCount, onAddCard, onOpenMenu, children }: ColumnProps) {
  const isEmpty = cardCount === 0;

  return (
    <View className="w-full gap-3 rounded-[24px] bg-column-background p-4">
      <View className="flex-row items-center justify-between">
        <View
          accessible
          accessibilityRole="header"
          accessibilityLabel={ptBR.board.columnSummary(title, cardCount)}
          className="flex-1 flex-row items-center gap-2"
        >
          <Text numberOfLines={1} className="shrink text-subtitle text-text-primary">
            {title}
          </Text>
          <Text className="text-body text-text-secondary">{cardCount}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={ptBR.board.columnOptions}
          onPress={onOpenMenu}
          className="-mr-3 h-11 w-11 items-center justify-center rounded-full active:opacity-60"
        >
          <Ellipsis size={MENU_ICON_SIZE} color={colors.textSecondary} />
        </Pressable>
      </View>

      {isEmpty ? (
        <EmptyState
          message={ptBR.board.emptyColumn}
          action={
            <Button
              label={ptBR.board.addCard}
              icon={Plus}
              variant="secondary"
              onPress={onAddCard}
            />
          }
        />
      ) : (
        <>
          {children}
          <Button label={ptBR.board.addCard} icon={Plus} variant="ghost" onPress={onAddCard} />
        </>
      )}
    </View>
  );
}
