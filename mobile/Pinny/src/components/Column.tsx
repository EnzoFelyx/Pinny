import { Ellipsis, Plus } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ptBR } from '@/i18n/pt-BR';
import { colors } from '@/theme';

import { Button } from './Button';
import { EmptyState } from './EmptyState';

interface ColumnHeaderProps {
  title: string;
  cardCount: number;
  onOpenMenu: () => void;
}

interface ColumnFooterProps {
  cardCount: number;
  onAddCard: () => void;
}

interface ColumnProps extends ColumnHeaderProps, ColumnFooterProps {
  // Lista de cartões.
  children?: ReactNode;
}

const MENU_ICON_SIZE = 18;

// Título, contagem e menu da coluna. No quadro, fica preso no topo enquanto os cartões rolam.
export function ColumnHeader({ title, cardCount, onOpenMenu }: ColumnHeaderProps) {
  return (
    <View className="flex-row items-center justify-between bg-column-background pb-3 pt-4">
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
  );
}

// Fim da coluna: o estado vazio (com o botão em destaque) ou o "Adicionar cartão" discreto.
export function ColumnFooter({ cardCount, onAddCard }: ColumnFooterProps) {
  if (cardCount === 0) {
    return (
      <EmptyState
        message={ptBR.board.emptyColumn}
        action={
          <Button label={ptBR.board.addCard} icon={Plus} variant="secondary" onPress={onAddCard} />
        }
      />
    );
  }
  return <Button label={ptBR.board.addCard} icon={Plus} variant="ghost" onPress={onAddCard} />;
}

// Todas as colunas têm a mesma cor neutra (sem cor por coluna na v1).
export function Column({ title, cardCount, onAddCard, onOpenMenu, children }: ColumnProps) {
  return (
    <View className="w-full rounded-[24px] bg-column-background px-4 pb-4">
      <ColumnHeader title={title} cardCount={cardCount} onOpenMenu={onOpenMenu} />
      <View className="gap-3">
        {cardCount > 0 ? children : null}
        <ColumnFooter cardCount={cardCount} onAddCard={onAddCard} />
      </View>
    </View>
  );
}
