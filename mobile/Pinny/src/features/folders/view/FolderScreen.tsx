import { Search } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Input } from '@/components/Input';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useDestructiveConfirm } from '@/hooks/useDestructiveConfirm';
import { ptBR } from '@/i18n/pt-BR';
import { colors, duration } from '@/theme';

import { useFolderViewModel } from '../viewmodel/useFolderViewModel';
import { BoardGrid } from './components/BoardGrid';
import { FolderBadge } from './components/FolderBadge';
import { FolderMenu, folderTitleLabels } from './components/FolderMenu';
import { FolderSkeleton } from './components/FolderSkeleton';
import { SelectionHeader } from './components/SelectionHeader';
import { SelectionToolbar } from './components/SelectionToolbar';
import { folderInkColors } from './folderAppearance';

const text = ptBR.folders.folderScreen;

interface FolderScreenProps {
  folderId: string;
}

// Tela da pasta: todos os quadros dela em grade, com busca pelo nome e o "Novo quadro" no fim.
// O topo é o mesmo do quadro (voltar, título editável e "…").
export function FolderScreen({ folderId }: FolderScreenProps) {
  const vm = useFolderViewModel(folderId);
  useDestructiveConfirm(vm.deleteBoardRequest, {
    onConfirm: vm.confirmDeleteBoard,
    onCancel: vm.cancelDeleteBoard,
  });
  useDestructiveConfirm(vm.deleteFolderRequest, {
    onConfirm: vm.confirmDeleteFolder,
    onCancel: vm.cancelDeleteFolder,
  });

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      {vm.selection.isSelecting ? (
        <SelectionHeader
          title={vm.selection.title}
          hint={vm.selection.hint}
          onCancel={vm.selection.cancel}
        />
      ) : (
        <ScreenHeader
          title={vm.title}
          subtitle={vm.subtitle}
          isLoading={vm.isLoading}
          errorText={vm.errorText}
          onBack={vm.goBack}
          onTitlePress={vm.customizeFolder}
          renameLabels={folderTitleLabels}
          leading={vm.isLoading ? null : <FolderBadge icon={vm.icon} color={vm.color} />}
          renderMenu={() => (
            <FolderMenu
              onCustomize={vm.customizeFolder}
              onCreateBoard={vm.createBoard}
              onSelect={vm.selection.start}
              onDelete={vm.requestDeleteFolder}
            />
          )}
        />
      )}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        // Selecionando: espaço extra no fim para os botões de vidro não cobrirem o último quadro.
        contentContainerClassName={`gap-4 px-6 ${vm.selection.isSelecting ? 'pb-28' : 'pb-12'}`}
      >
        {vm.isLoading ? (
          <Animated.View exiting={FadeOut.duration(duration.normal)}>
            <FolderSkeleton />
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.duration(duration.normal)} className="gap-4">
            {vm.hasBoards ? (
              <>
                <Input
                  label={text.searchLabel}
                  isLabelHidden
                  icon={Search}
                  placeholder={text.searchPlaceholder}
                  value={vm.query}
                  onChangeText={vm.changeQuery}
                  returnKeyType="search"
                />
                {vm.noResultsText ? (
                  <Text className="text-body text-text-secondary">{vm.noResultsText}</Text>
                ) : null}
                {/* Mesmo sem resultado na busca, o "Novo quadro" continua na grade. */}
                <BoardGrid
                  boards={vm.boards}
                  noteColor={folderInkColors[vm.color]}
                  onOpenBoard={vm.openBoard}
                  boardMenu={vm.boardMenu}
                  // Selecionando: círculo em cada quadro e sem o "Novo quadro".
                  selection={
                    vm.selection.isSelecting
                      ? {
                          selectedIds: vm.selection.selectedIds,
                          onToggle: vm.selection.toggle,
                        }
                      : undefined
                  }
                  add={
                    vm.selection.isSelecting
                      ? undefined
                      : {
                          label: text.newBoard,
                          accessibilityLabel: vm.createBoardAccessibilityLabel,
                          onPress: vm.createBoard,
                        }
                  }
                />
              </>
            ) : (
              <View className="pt-8">
                <EmptyState
                  message={text.empty}
                  action={<Button label={text.createBoard} onPress={vm.createBoard} />}
                />
              </View>
            )}
          </Animated.View>
        )}
      </ScrollView>
      {vm.selection.isSelecting ? (
        <SelectionToolbar
          pin={vm.selection.pin}
          canDelete={vm.selection.canDelete}
          onTogglePin={vm.selection.togglePin}
          onDelete={vm.selection.requestDelete}
        />
      ) : null}
    </SafeAreaView>
  );
}

// SafeAreaView não aceita className (REGRAS.md, regra 5).
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
});
