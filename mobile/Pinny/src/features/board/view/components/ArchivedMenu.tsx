import { Button, Divider, Picker, Text } from '@expo/ui/swift-ui';
import { pickerStyle, tag } from '@expo/ui/swift-ui/modifiers';

import { GlassMenu } from '@/components/GlassMenu';
import type { ArchivedOrder } from '@/features/board/model/archivedCards';
import { ptBR } from '@/i18n/pt-BR';

const text = ptBR.board.archived;

interface SortOption {
  value: ArchivedOrder;
  label: string;
}

interface ArchivedMenuProps {
  onSearch: () => void;
  onSelect: () => void;
  onFilter: () => void;
  sortOptions: readonly SortOption[];
  order: ArchivedOrder;
  onSort: (order: ArchivedOrder) => void;
  // Sem arquivados, o "Apagar todos" some.
  onDeleteAll: (() => void) | null;
}

// "…" do topo da tela "Arquivados" (menu suspenso nativo do iOS): Buscar, Selecionar, Filtrar e o
// submenu Ordenar (Picker nativo); separado e em vermelho, Apagar todos.
export function ArchivedMenu({
  onSearch,
  onSelect,
  onFilter,
  sortOptions,
  order,
  onSort,
  onDeleteAll,
}: ArchivedMenuProps) {
  return (
    <GlassMenu accessibilityLabel={text.options}>
      <Button label={text.menu.search} systemImage="magnifyingglass" onPress={onSearch} />
      <Button label={text.menu.select} systemImage="checkmark.circle" onPress={onSelect} />
      <Button
        label={text.menu.filter}
        systemImage="line.3.horizontal.decrease.circle"
        onPress={onFilter}
      />
      {/* Picker no estilo menu: o submenu padrão do iOS, com o check na coluna do sistema e a
          opção em uso embaixo de "Ordenar". */}
      <Picker
        label={text.menu.sort}
        systemImage="arrow.up.arrow.down"
        selection={order}
        onSelectionChange={onSort}
        modifiers={[pickerStyle('menu')]}
      >
        {sortOptions.map((option) => (
          <Text key={option.value} modifiers={[tag(option.value)]}>
            {option.label}
          </Text>
        ))}
      </Picker>
      {onDeleteAll ? <Divider /> : null}
      {onDeleteAll ? (
        <Button
          label={text.menu.deleteAll}
          systemImage="trash"
          role="destructive"
          onPress={onDeleteAll}
        />
      ) : null}
    </GlassMenu>
  );
}
