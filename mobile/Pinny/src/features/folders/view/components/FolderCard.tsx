import { memo } from 'react';
import { Text, View } from 'react-native';

import type { HomeFolderItem } from '../../viewmodel/useFolderItems';
import { folderIcons, folderInkColors } from '../folderAppearance';
import { AddBoardTile } from './AddBoardTile';
import { BoardGrid } from './BoardGrid';
import { type FolderCardActions, FolderCardMenu } from './FolderCardMenu';

interface FolderCardProps {
  folder: HomeFolderItem;
  onOpenBoard: (boardId: string) => void;
  // Sem actions (ex.: na busca), o "⋮" não aparece.
  actions?: FolderCardActions;
  // Sem onCreateBoard (ex.: na busca), o "+" depois dos quadros não aparece.
  onCreateBoard?: (folderId: string) => void;
  // Com ele (Início), a pasta mostra só os primeiros quadros e "+N quadros" abre a pasta.
  onOpenFolder?: (folderId: string) => void;
}

const FOLDER_ICON_SIZE = 22;

export const FolderCard = memo(function FolderCard({
  folder,
  onOpenBoard,
  actions,
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
    onOpenFolder && folder.seeAllText
      ? {
          label: folder.seeAllText,
          accessibilityLabel: folder.seeAllAccessibilityLabel,
          onPress: () => onOpenFolder(folder.id),
        }
      : undefined;
  // Na Início, o contador fica embaixo do nome (o nome usa a linha toda); na busca, à direita.
  const isCountBelow = onOpenFolder !== undefined;

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
          {isCountBelow ? (
            <View className="flex-1">
              <Text numberOfLines={1} className="text-subtitle text-text-primary">
                {folder.title}
              </Text>
              <Text className="text-caption text-text-secondary">{folder.boardCountText}</Text>
            </View>
          ) : (
            <>
              <Text numberOfLines={1} className="flex-1 text-subtitle text-text-primary">
                {folder.title}
              </Text>
              <Text className="text-caption text-text-secondary">{folder.boardCountText}</Text>
            </>
          )}
        </View>
        {actions ? (
          // Margens negativas: a área de toque de 44pt não aumenta a altura do cabeçalho.
          <View className="-my-3 -mr-3">
            <FolderCardMenu
              folderId={folder.id}
              accessibilityLabel={folder.optionsAccessibilityLabel}
              actions={actions}
            />
          </View>
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
