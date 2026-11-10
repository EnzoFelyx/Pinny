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
  // Esconde o "…" e deixa o espaço dele (ex.: modo de seleção do quadro), sem o título pular.
  isMenuHidden?: boolean;
  // Com o "…" escondido, aparece no lugar dele (ex.: "Selecionar todos" no modo de seleção).
  accessory?: ReactNode;
  // Só de leitura (ex.: Arquivados): sem lápis nem "…".
  isReadOnly?: boolean;
}

interface ColumnFooterProps {
  // Sem cartões (nem vaga de arraste): mostra o estado vazio.
  isEmpty: boolean;
  // Sem ele, o botão "Adicionar cartão" não aparece (ex.: modo de seleção do quadro).
  onAddCard?: () => void;
  // Variação do estado vazio (frase + ilustração). Sem ela, a frase e o desenho padrão.
  emptyMessage?: string;
  emptyVariant?: IllustrationVariant;
}

interface ColumnProps extends ColumnHeaderProps {
  // Sem ele, sem o botão "Adicionar cartão".
  onAddCard?: () => void;
  // Frase do estado vazio (sem ela, a padrão).
  emptyMessage?: string;
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
  isMenuHidden = false,
  accessory,
  isReadOnly = false,
}: ColumnHeaderProps) {
  const hidesMenu = isMenuHidden || isReadOnly;
  return (
    <View className="flex-row items-center justify-between bg-column-background pb-3 pt-4">
      <ColumnTitle
        title={title}
        cardCount={cardCount}
        onRename={onRename}
        onEditingChange={onEditingChange}
        showsRenameIcon={!isReadOnly}
      />
      {/* Área de toque de 44pt; as margens negativas deixam o ícone a 8pt do selo, como no Figma. */}
      {hidesMenu && accessory ? (
        <View className="ml-2 h-11 justify-center">{accessory}</View>
      ) : hidesMenu ? (
        <View className="-ml-[5px] -mr-3 h-11 w-11" />
      ) : menu ? (
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
          onAddCard ? (
            <Button
              label={ptBR.board.addCard}
              icon={Plus}
              variant="secondary"
              onPress={onAddCard}
            />
          ) : undefined
        }
      />
    );
  }
  if (!onAddCard) return null;
  return <Button label={ptBR.board.addCard} icon={Plus} variant="ghost" onPress={onAddCard} />;
}

// Todas as colunas têm a mesma cor neutra (sem cor por coluna na v1).
export function Column({
  title,
  cardCount,
  onAddCard,
  onOpenMenu,
  isReadOnly,
  emptyMessage,
  children,
}: ColumnProps) {
  return (
    <View className="w-full rounded-[24px] bg-column-background px-4 pb-4">
      <ColumnHeader
        title={title}
        cardCount={cardCount}
        onOpenMenu={onOpenMenu}
        isReadOnly={isReadOnly}
      />
      <View className="gap-3">
        {cardCount > 0 ? children : null}
        <ColumnFooter isEmpty={cardCount === 0} onAddCard={onAddCard} emptyMessage={emptyMessage} />
      </View>
    </View>
  );
}
