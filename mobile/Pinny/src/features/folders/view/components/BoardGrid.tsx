import { View } from 'react-native';

import type { HomeBoardItem } from '../../viewmodel/useFolderItems';
import { AddBoardTile } from './AddBoardTile';
import { BoardTile } from './BoardTile';
import { MoreBoardsTile } from './MoreBoardsTile';
import { PinnableBoardTile } from './PinnableBoardTile';

const BOARDS_PER_ROW = 2;

interface TileAction {
  label?: string;
  accessibilityLabel: string;
  onPress: () => void;
}

interface BoardGridProps {
  boards: readonly HomeBoardItem[];
  // Cor escura da pasta, usada nas miniaturas.
  noteColor: string;
  onOpenBoard: (boardId: string) => void;
  // "+" sempre depois do último quadro (sem ele, não aparece).
  add?: TileAction;
  // "+N ›" (Início): divide a última vaga com o "+", depois dele.
  more?: TileAction & { label: string };
  // Tela da pasta: segurar o quadro fixa ou desafixa na Início.
  onTogglePin?: (boardId: string) => void;
  // Modo "Fixar quadros": círculo de seleção em cada quadro; o toque marca/desmarca.
  selection?: { selectedIds: readonly string[]; onToggle: (boardId: string) => void };
}

// Item da grade: um quadro, o "+" ou o "+" seguido do "+N ›".
type Tile = { kind: 'board'; board: HomeBoardItem } | { kind: 'add' } | { kind: 'more' };

function tileKey(tile: Tile): string {
  return tile.kind === 'board' ? tile.board.id : tile.kind;
}

function toRows(tiles: readonly Tile[]): Tile[][] {
  const rows: Tile[][] = [];
  for (let index = 0; index < tiles.length; index += BOARDS_PER_ROW) {
    rows.push(tiles.slice(index, index + BOARDS_PER_ROW));
  }
  return rows;
}

// Quadros de uma pasta em grade de 2 por linha (Início e tela da pasta).
export function BoardGrid({
  boards,
  noteColor,
  onOpenBoard,
  add,
  more,
  onTogglePin,
  selection,
}: BoardGridProps) {
  const tiles: Tile[] = [
    ...boards.map((board) => ({ kind: 'board', board }) as const),
    ...(more ? [{ kind: 'more' } as const] : add ? [{ kind: 'add' } as const] : []),
  ];

  const addTile = add ? (
    <AddBoardTile
      accessibilityLabel={add.accessibilityLabel}
      label={add.label}
      onPress={add.onPress}
    />
  ) : null;

  const renderTile = (tile: Tile) => {
    if (tile.kind === 'board') {
      if (selection) {
        return (
          <BoardTile
            key={tile.board.id}
            board={tile.board}
            noteColor={noteColor}
            onOpen={selection.onToggle}
            isSelected={selection.selectedIds.includes(tile.board.id)}
          />
        );
      }
      if (onTogglePin) {
        return (
          <PinnableBoardTile
            key={tile.board.id}
            board={tile.board}
            noteColor={noteColor}
            onOpen={onOpenBoard}
            onTogglePin={onTogglePin}
          />
        );
      }
      return (
        <BoardTile
          key={tile.board.id}
          board={tile.board}
          noteColor={noteColor}
          onOpen={onOpenBoard}
        />
      );
    }
    if (tile.kind === 'more' && more) {
      return (
        <View key="more" className="flex-1 flex-row gap-2.5">
          {addTile}
          <MoreBoardsTile
            label={more.label}
            accessibilityLabel={more.accessibilityLabel}
            onPress={more.onPress}
          />
        </View>
      );
    }
    // Ocupa a vaga de um quadro, mas o bloco só tem a largura do conteúdo, à esquerda.
    return (
      <View key="add" className="flex-1 items-start">
        {addTile}
      </View>
    );
  };

  return (
    <View className="gap-2.5">
      {toRows(tiles).map((row) => (
        <View key={row.map(tileKey).join()} className="flex-row gap-2.5">
          {row.map(renderTile)}
          {/* Linha com um item só: o espaço vazio mantém a largura igual à dos outros. */}
          {row.length < BOARDS_PER_ROW ? <View className="flex-1" /> : null}
        </View>
      ))}
    </View>
  );
}
