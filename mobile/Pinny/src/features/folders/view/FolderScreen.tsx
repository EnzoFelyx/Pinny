import { Search } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Input } from '@/components/Input';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ptBR } from '@/i18n/pt-BR';
import { colors, duration } from '@/theme';

import { useFolderViewModel } from '../viewmodel/useFolderViewModel';
import { BoardGrid } from './components/BoardGrid';
import { FolderBadge } from './components/FolderBadge';
import { FolderMenu, folderTitleLabels } from './components/FolderMenu';
import { FolderSkeleton } from './components/FolderSkeleton';
import { PinSelectionHeader } from './components/PinSelectionHeader';
import { folderInkColors } from './folderAppearance';

const text = ptBR.folders.folderScreen;

interface FolderScreenProps {
  folderId: string;
}

// Tela da pasta: todos os quadros dela em grade, com busca pelo nome e o "Novo quadro" no fim.
// O topo é o mesmo do quadro (voltar, título editável e "…").
export function FolderScreen({ folderId }: FolderScreenProps) {
  const vm = useFolderViewModel(folderId);

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      {vm.pinSelection.isSelecting ? (
        <PinSelectionHeader
          title={vm.pinSelection.title}
          onCancel={vm.pinSelection.cancel}
          onDone={vm.pinSelection.confirm}
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
              onPinBoards={vm.pinSelection.start}
            />
          )}
        />
      )}
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="gap-4 px-6 pb-12">
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
                  onTogglePin={vm.togglePinBoard}
                  // Escolhendo os fixados: círculo em cada quadro e sem o "Novo quadro".
                  selection={
                    vm.pinSelection.isSelecting
                      ? {
                          selectedIds: vm.pinSelection.selectedIds,
                          onToggle: vm.pinSelection.toggle,
                        }
                      : undefined
                  }
                  add={
                    vm.pinSelection.isSelecting
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
    </SafeAreaView>
  );
}

// SafeAreaView não aceita className (REGRAS.md, regra 5).
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
});
