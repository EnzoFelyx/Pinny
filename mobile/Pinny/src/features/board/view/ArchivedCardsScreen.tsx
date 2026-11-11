import { ArchiveRestore, Trash2 } from 'lucide-react-native';
import { useEffect } from 'react';
import { AccessibilityInfo, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { Column } from '@/components/Column';
import { GlassSearchField } from '@/components/GlassSearchField';
import { GlassTextButton } from '@/components/GlassTextButton';
import { GlassToolbar } from '@/components/GlassToolbar';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useDestructiveConfirm } from '@/hooks/useDestructiveConfirm';
import { ptBR } from '@/i18n/pt-BR';
import { colors } from '@/theme';

import { useArchivedCardsViewModel } from '../viewmodel/useArchivedCardsViewModel';
import { ArchivedCardMenu } from './components/ArchivedCardMenu';
import { ArchivedMenu } from './components/ArchivedMenu';
import { BoardFilterModal } from './components/BoardFilterModal';
import { boardRenameLabels } from './components/BoardMenu';
import { BoardToolbar } from './components/BoardToolbar';
import { ColumnSelectionToggle } from './components/ColumnSelectionToggle';

const text = ptBR.board;

interface ArchivedCardsScreenProps {
  boardId: string;
}

// Selecionando, a lista ganha espaço embaixo para os botões flutuantes não cobrirem o último cartão.
const listClass = {
  default: 'gap-4 px-6 pb-6',
  selecting: 'gap-4 px-6 pb-28',
} as const;

// Tela "Arquivados" do quadro: os cartões arquivados em colunas só de leitura (uma só ou uma por
// coluna de origem, pelo "Ordenar"). O "…" tem Buscar, Selecionar, Filtrar, Ordenar e Apagar
// todos; segurar um cartão desarquiva.
export function ArchivedCardsScreen({ boardId }: ArchivedCardsScreenProps) {
  const vm = useArchivedCardsViewModel(boardId);
  const { search, selection, searchResultText } = vm;
  const marked = selection.selectedIds;

  // Leitor de tela: a busca anuncia quantos cartões encontrou.
  useEffect(() => {
    if (searchResultText) AccessibilityInfo.announceForAccessibility(searchResultText);
  }, [searchResultText]);
  useDestructiveConfirm(vm.deleteRequest, {
    onConfirm: vm.confirmDelete,
    onCancel: vm.cancelDelete,
  });

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      {/* Buscando, o campo de vidro toma o lugar do título e do "…", e o voltar fecha a busca.
          Selecionando, o título vira a contagem e o "…" vira "Cancelar". */}
      <ScreenHeader
        title={vm.title}
        subtitle={vm.subtitle}
        isLoading={vm.isLoading}
        errorText={vm.errorText}
        onBack={search.isSearching ? search.cancel : vm.goBack}
        backAccessibilityLabel={search.isSearching ? text.search.close : undefined}
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
        renderMenu={() =>
          search.isSearching || vm.isLoading ? null : selection.isSelecting ? (
            <GlassTextButton
              label={text.selection.cancel}
              accessibilityLabel={text.selection.cancelA11y}
              onPress={selection.cancel}
            />
          ) : (
            <ArchivedMenu
              onSearch={search.start}
              onSelect={selection.start}
              onFilter={vm.filter.open}
              sortOptions={vm.sortOptions}
              order={vm.order}
              onSort={vm.setOrder}
              onDeleteAll={vm.hasArchived ? vm.requestDeleteAll : null}
            />
          )
        }
      />
      {/* Só com filtro ligado: os chips removíveis e o "Limpar". */}
      {vm.filter.hasActiveFilter ? <BoardToolbar isLoading={false} filter={vm.filter} /> : null}
      {vm.isLoading ? null : (
        <ScrollView
          contentContainerClassName={listClass[selection.isSelecting ? 'selecting' : 'default']}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        >
          {vm.groups.map((group) => (
            <Column
              key={group.key}
              title={group.title}
              cardCount={group.cards.length}
              isReadOnly
              emptyMessage={group.emptyMessage}
              accessory={
                selection.isSelecting && group.cards.length > 0 ? (
                  <ColumnSelectionToggle
                    columnTitle={group.title}
                    hasSelected={group.hasSelected}
                    onSelectAll={group.selectAll}
                    onClear={group.clear}
                  />
                ) : undefined
              }
            >
              {group.cards.map((card) =>
                marked ? (
                  <Card
                    key={card.id}
                    title={card.title}
                    titleParts={card.titleParts}
                    accessibilityLabel={card.accessibilityLabel}
                    labels={card.labels}
                    priority={card.priority}
                    deadline={card.deadline}
                    checklistText={card.checklistText}
                    isSelected={marked.has(card.id)}
                    onPress={() => selection.toggle(card.id)}
                  />
                ) : (
                  <ArchivedCardMenu key={card.id} card={card} onUnarchive={vm.unarchiveOne} />
                ),
              )}
            </Column>
          ))}
        </ScrollView>
      )}

      {selection.isSelecting ? (
        // Desarquivar à esquerda e Apagar (vermelho) à direita, apagados até marcar um cartão.
        <GlassToolbar
          actions={[
            {
              key: 'unarchive',
              icon: ArchiveRestore,
              tone: 'accent',
              accessibilityLabel: text.archived.unarchiveA11y,
              onPress: vm.unarchiveSelected,
              disabled: !vm.canAct,
            },
            {
              key: 'delete',
              icon: Trash2,
              tone: 'destructive',
              accessibilityLabel: text.selection.deleteA11y,
              onPress: vm.requestDeleteSelected,
              disabled: !vm.canAct,
            },
          ]}
        />
      ) : null}

      <BoardFilterModal filter={vm.filter} />
    </SafeAreaView>
  );
}

// SafeAreaView não aceita className (REGRAS.md, regra 5).
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
});
