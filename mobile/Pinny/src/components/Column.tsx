import { Ellipsis, Plus } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { ptBR } from '@/i18n/pt-BR';
import { colors } from '@/theme';

import { Button } from './Button';
import { ColumnTitle } from './ColumnTitle';
import { EmptyState } from './EmptyState';
import type { IllustrationVariant } from './StickyNoteIllustration';

interface ColumnHeaderProps {
  title: string;
  cardCount: number;
  // "…" simples (sem menu próprio).
  onOpenMenu?: () => void;
  // Renomear tocando no lápis ou no nome (sem ele, o título é só leitura).
  onRename?: (title: string) => void;
  onEditingChange?: (isEditing: boolean) => void;
  // Menu próprio no lugar do "…" simples (ex.: o menu suspenso nativo do quadro). Ocupa a mesma
  // área de toque de 44pt.
  menu?: ReactNode;
}

interface ColumnFooterProps {
  // Sem cartões (nem vaga de arraste): mostra o estado vazio.
  isEmpty: boolean;
  onAddCard: () => void;
  // Variação do estado vazio (frase + ilustração). Sem ela, a frase e o desenho padrão.
  emptyMessage?: string;
  emptyVariant?: IllustrationVariant;
}

interface ColumnProps extends ColumnHeaderProps {
  onAddCard: () => void;
  // Lista de cartões.
  children?: ReactNode;
}

const MENU_ICON_SIZE = 18;

// Título, contagem e menu da coluna. No quadro, fica preso no topo enquanto os cartões rolam.
export function ColumnHeader({
  title,
  cardCount,
  onOpenMenu,
  menu,
  onRename,
  onEditingChange,
}: ColumnHeaderProps) {
  return (
    <View className="flex-row items-center justify-between bg-column-background pb-3 pt-4">
      <ColumnTitle
        title={title}
        cardCount={cardCount}
        onRename={onRename}
        onEditingChange={onEditingChange}
      />
      {/* Área de toque de 44pt; as margens negativas deixam o ícone a 8pt do selo, como no Figma. */}
      {menu ? (
        <View className="-ml-[5px] -mr-3 h-11 w-11">{menu}</View>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={ptBR.board.columnOptions}
          onPress={onOpenMenu}
          className="-ml-[5px] -mr-3 h-11 w-11 items-center justify-center rounded-full active:opacity-60"
        >
          <Ellipsis size={MENU_ICON_SIZE} color={colors.textSecondary} />
        </Pressable>
      )}
    </View>
  );
}

// Fim da coluna: o estado vazio (com o botão em destaque) ou o "Adicionar cartão" discreto.
export function ColumnFooter({
  isEmpty,
  onAddCard,
  emptyMessage = ptBR.board.emptyColumn,
  emptyVariant,
}: ColumnFooterProps) {
  if (isEmpty) {
    return (
      <EmptyState
        message={emptyMessage}
        illustrationVariant={emptyVariant}
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
        <ColumnFooter isEmpty={cardCount === 0} onAddCard={onAddCard} />
      </View>
    </View>
  );
}
