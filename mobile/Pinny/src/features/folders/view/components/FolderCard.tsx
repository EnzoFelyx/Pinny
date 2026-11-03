import { Pencil } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { colors } from '@/theme';

import type { HomeFolderItem } from '../../viewmodel/useFolderItems';
import { folderIcons, folderInkColors } from '../folderAppearance';
import { AddBoardTile } from './AddBoardTile';
import { BoardGrid } from './BoardGrid';

interface FolderCardProps {
  folder: HomeFolderItem;
  onOpenBoard: (boardId: string) => void;
  // Sem onRename (ex.: na busca), o lápis não aparece.
  onRename?: (folderId: string) => void;
  // Sem onCreateBoard (ex.: na busca), o "+" depois dos quadros não aparece.
  onCreateBoard?: (folderId: string) => void;
  // Com ele (Início), a pasta mostra só os primeiros quadros e "+N quadros" abre a pasta.
  onOpenFolder?: (folderId: string) => void;
}

const FOLDER_ICON_SIZE = 22;
const PENCIL_SIZE = 15;

export const FolderCard = memo(function FolderCard({
  folder,
  onOpenBoard,
  onRename,
  onCreateBoard,
  onOpenFolder,
}: FolderCardProps) {
  const Icon = folderIcons[folder.icon];
  const inkColor = folderInkColors[folder.color];
  const add = onCreateBoard
    ? {
        accessibilityLabel: folder.createBoardAccessibilityLabel,
        onPress: () => onCreateBoard(folder.id),
      }
    : undefined;
  const more =
    onOpenFolder && folder.moreBoardsText
      ? {
          label: folder.moreBoardsText,
          accessibilityLabel: folder.moreBoardsAccessibilityLabel,
          onPress: () => onOpenFolder(folder.id),
        }
      : undefined;

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

      {folder.createFirstBoardText && add ? (
        <AddBoardTile
          accessibilityLabel={add.accessibilityLabel}
          label={folder.createFirstBoardText}
          onPress={add.onPress}
        />
      ) : folder.boards.length === 0 ? (
        <Text className="text-body text-text-secondary">{folder.emptyText}</Text>
      ) : (
        <BoardGrid
          boards={onOpenFolder ? folder.previewBoards : folder.boards}
          noteColor={inkColor}
          onOpenBoard={onOpenBoard}
          add={add}
          more={more}
        />
      )}
    </View>
  );
});
