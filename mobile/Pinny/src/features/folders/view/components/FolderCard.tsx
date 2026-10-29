import { Pencil } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { colors } from '@/theme';

import type { HomeBoardItem, HomeFolderItem } from '../../viewmodel/useFolderItems';
import { folderIcons, folderInkColors } from '../folderAppearance';
import { BoardTile } from './BoardTile';

interface FolderCardProps {
  folder: HomeFolderItem;
  onOpenBoard: (boardId: string) => void;
  // Sem onRename (ex.: na busca), o lápis não aparece.
  onRename?: (folderId: string) => void;
}

const FOLDER_ICON_SIZE = 22;
const PENCIL_SIZE = 15;
const BOARDS_PER_ROW = 2;

// Quadros em grade de 2 por linha.
function toRows(boards: readonly HomeBoardItem[]): HomeBoardItem[][] {
  const rows: HomeBoardItem[][] = [];
  for (let index = 0; index < boards.length; index += BOARDS_PER_ROW) {
    rows.push(boards.slice(index, index + BOARDS_PER_ROW));
  }
  return rows;
}

export const FolderCard = memo(function FolderCard({
  folder,
  onOpenBoard,
  onRename,
}: FolderCardProps) {
  const Icon = folderIcons[folder.icon];
  const inkColor = folderInkColors[folder.color];

  return (
    <View className="gap-[11px] rounded-[24px] bg-surface p-4">
      <View className="flex-row items-center gap-[9px]">
        <View
          accessible
          accessibilityRole="header"
          accessibilityLabel={folder.accessibilityLabel}
          className="flex-1 flex-row items-center gap-[9px]"
        >
          <Icon size={FOLDER_ICON_SIZE} color={inkColor} />
          <Text numberOfLines={1} className="flex-1 text-subtitle text-text-primary">
            {folder.title}
          </Text>
          <Text className="text-caption text-text-secondary">{folder.boardCountText}</Text>
        </View>
        {onRename ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={folder.renameAccessibilityLabel}
            onPress={() => onRename(folder.id)}
            className="-my-3 -mr-3 h-11 w-11 items-center justify-center rounded-full active:opacity-60"
          >
            <Pencil size={PENCIL_SIZE} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      {folder.emptyText ? (
        <Text className="text-body text-text-secondary">{folder.emptyText}</Text>
      ) : (
        toRows(folder.boards).map((row) => (
          <View key={row.map((board) => board.id).join()} className="flex-row gap-2.5">
            {row.map((board) => (
              <BoardTile key={board.id} board={board} noteColor={inkColor} onOpen={onOpenBoard} />
            ))}
            {/* Linha com um quadro só: o espaço vazio mantém a largura igual à dos outros. */}
            {row.length < BOARDS_PER_ROW ? <View className="flex-1" /> : null}
          </View>
        ))
      )}
    </View>
  );
});
