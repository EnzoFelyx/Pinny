import { memo } from 'react';
import { Pressable, Text } from 'react-native';

import type { HomeBoardItem } from '../../viewmodel/useFolderItems';
import { BoardThumbnail } from './BoardThumbnail';

interface BoardTileProps {
  board: HomeBoardItem;
  noteColor: string;
  onOpen: (boardId: string) => void;
}

export const BoardTile = memo(function BoardTile({ board, noteColor, onOpen }: BoardTileProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={board.accessibilityLabel}
      onPress={() => onOpen(board.id)}
      className={`h-[58px] flex-1 flex-row items-center gap-2 rounded-[12px] p-2.5 active:opacity-70 ${
        board.isHighlighted ? 'bg-secondary' : 'bg-column-background'
      }`}
    >
      <BoardThumbnail noteColor={noteColor} />
      <Text numberOfLines={2} className="flex-1 text-tag text-text-primary">
        {board.title}
      </Text>
    </Pressable>
  );
});
