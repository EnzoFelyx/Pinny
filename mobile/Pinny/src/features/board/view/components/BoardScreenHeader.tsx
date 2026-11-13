import { GlassSearchField } from '@/components/GlassSearchField';
import { GlassTextButton } from '@/components/GlassTextButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ptBR } from '@/i18n/pt-BR';

import type { BoardViewModel } from '../../viewmodel/useBoardViewModel';
import { BoardMenu, boardRenameLabels } from './BoardMenu';

const text = ptBR.board;

interface BoardScreenHeaderProps {
  vm: BoardViewModel;
  // Skeleton no título e no subtítulo (o mesmo tempo mínimo do quadro).
  isLoading: boolean;
}

// Topo do quadro em três jeitos. Normal: título editável e "…". Selecionando: o título vira a
// contagem (sem renomear) e o "…" vira "Cancelar". Buscando: o campo de vidro toma o lugar do
// título, do subtítulo e do "…", e o voltar só fecha a busca (o quadro continua aberto).
export function BoardScreenHeader({ vm, isLoading }: BoardScreenHeaderProps) {
  const { selection, search } = vm;
  return (
    <ScreenHeader
      title={selection.isSelecting ? selection.title : vm.title}
      subtitle={selection.isSelecting ? selection.hint : vm.subtitle}
      isLoading={isLoading}
      errorText={vm.errorText}
      onBack={search.isSearching ? search.cancel : vm.goBack}
      backAccessibilityLabel={search.isSearching ? text.search.close : undefined}
      onRename={selection.isSelecting || search.isSearching ? undefined : vm.renameBoard}
      renameLabels={boardRenameLabels}
      titleReplacement={
        search.isSearching ? (
          <GlassSearchField
            value={search.query}
            onChangeText={search.setQuery}
            placeholder={text.search.placeholder}
            accessibilityLabel={text.search.inputA11y}
          />
        ) : null
      }
      renderMenu={(startRename) =>
        search.isSearching ? null : selection.isSelecting ? (
          <GlassTextButton
            label={text.selection.cancel}
            accessibilityLabel={text.selection.cancelA11y}
            onPress={selection.cancel}
          />
        ) : (
          <BoardMenu
            onSearch={search.start}
            onSelectCards={selection.start}
            onRename={startRename}
            onCreateColumn={vm.createColumn}
            onOpenArchived={vm.openArchived}
            onDuplicate={vm.duplicateBoard}
            onMoveToFolder={vm.moveBoardToFolder}
            onDelete={vm.requestDeleteBoard}
          />
        )
      }
    />
  );
}
