import { Pin } from 'lucide-react-native';
import { memo } from 'react';
import { Text, View } from 'react-native';

import { colors } from '@/theme';

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

const FOLDER_ICON_SIZE = 20;
const PIN_ICON_SIZE = 15;

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
    onOpenFolder && folder.hasMoreBoards
      ? {
          accessibilityLabel: folder.seeAllAccessibilityLabel,
          onPress: () => onOpenFolder(folder.id),
        }
      : undefined;
  return (
    <View className="gap-2 rounded-[24px] bg-surface p-3">
      <View className="h-8 flex-row items-center gap-1.5">
        {/* Nome encolhe antes do contador e do alfinete: nome longo corta com "…". */}
        <View
          accessible
          accessibilityRole="header"
          accessibilityLabel={folder.accessibilityLabel}
          className="flex-1 flex-row items-center gap-1.5"
        >
          <Icon size={FOLDER_ICON_SIZE} color={inkColor} />
          <Text numberOfLines={1} className="flex-1 text-subtitle text-text-primary">
            {folder.title}
          </Text>
          <Text className="text-caption text-text-secondary">{folder.boardCountText}</Text>
          {folder.isPinned ? (
            <View className="w-7 items-center">
              <Pin size={PIN_ICON_SIZE} color={colors.primary} />
            </View>
          ) : null}
        </View>
        {actions ? (
          // Margens negativas: a área de toque de 44pt não aumenta a altura do cabeçalho.
          <View className="-my-3 -mr-3">
            <FolderCardMenu
              folderId={folder.id}
              accessibilityLabel={folder.optionsAccessibilityLabel}
              isPinned={folder.isPinned}
              pinLabel={folder.canTogglePin ? folder.pinActionLabel : null}
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
          // Com "+N ›", o "+" sai: o novo quadro fica no "⋮" ou dentro da pasta.
          add={more ? undefined : add}
          more={more}
        />
      )}
    </View>
  );
});
