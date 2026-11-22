import {
  Archive,
  ArchiveRestore,
  CalendarClock,
  Columns3,
  ListChecks,
  type LucideIcon,
} from 'lucide-react-native';
import { Fragment } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { HairlineDivider } from '@/components/HairlineDivider';
import { Label } from '@/components/Label';
import { PriorityChip } from '@/components/PriorityChip';
import { SheetLayout } from '@/components/SheetLayout';
import { useDestructiveConfirm } from '@/hooks/useDestructiveConfirm';
import { ptBR } from '@/i18n/pt-BR';
import { colors } from '@/theme';

import type { ArchivedInfoKind, ArchivedInfoRow } from '../viewmodel/archivedCardSheet';
import { useArchivedCardViewModel } from '../viewmodel/useArchivedCardViewModel';

const text = ptBR.board.archived.sheet;
const ROW_ICON_SIZE = 18;

const rowIcon: Record<ArchivedInfoKind, LucideIcon> = {
  column: Columns3,
  archived: Archive,
  due: CalendarClock,
  checklist: ListChecks,
};

function InfoRow({ row }: { row: ArchivedInfoRow }) {
  const Icon = rowIcon[row.kind];
  return (
    <View
      accessible
      accessibilityLabel={row.accessibilityLabel}
      className="min-h-11 flex-row items-center gap-3 py-2"
    >
      <Icon size={ROW_ICON_SIZE} color={colors.textSecondary} />
      <Text className="flex-1 text-body text-text-secondary">{row.label}</Text>
      <Text className="shrink text-right text-label text-text-primary">{row.value}</Text>
    </View>
  );
}

interface ArchivedCardScreenProps {
  cardId: string;
}

// Folha nativa "Cartão arquivado" (tocar no cartão na tela "Arquivados"): só leitura. Etiquetas e
// prioridade, título, descrição e as linhas de informação (coluna de origem, quando foi arquivado,
// prazo e checklist). No rodapé, "Desarquivar em <coluna>" e, em vermelho, "Apagar". Editar o
// cartão continua exigindo desarquivar antes.
export function ArchivedCardScreen({ cardId }: ArchivedCardScreenProps) {
  const vm = useArchivedCardViewModel(cardId);
  const { sheet } = vm;
  useDestructiveConfirm(vm.deleteRequest, {
    onConfirm: vm.confirmDelete,
    onCancel: vm.cancelDelete,
  });

  return (
    <SheetLayout
      title={text.title}
      titleSize="compact"
      icon={Archive}
      footer={
        sheet ? (
          <View className="gap-2">
            {vm.errorText ? (
              <Text accessibilityLiveRegion="polite" className="text-body text-alert">
                {vm.errorText}
              </Text>
            ) : null}
            <Button label={sheet.unarchiveLabel} icon={ArchiveRestore} onPress={vm.unarchive} />
            <Button label={text.delete} variant="destructive" onPress={vm.requestDelete} />
          </View>
        ) : null
      }
    >
      {sheet ? (
        <View className="gap-4">
          {sheet.labels.length > 0 || sheet.priority ? (
            <View className="flex-row flex-wrap items-center gap-1.5">
              {sheet.labels.map((label) => (
                <Label key={label.id} name={label.name} color={label.color} />
              ))}
              {sheet.priority ? <PriorityChip priority={sheet.priority} /> : null}
            </View>
          ) : null}
          <Text accessibilityRole="header" className="text-title text-text-primary">
            {sheet.title}
          </Text>
          {sheet.description ? (
            <Text className="text-body text-text-secondary">{sheet.description}</Text>
          ) : null}
          <View>
            {sheet.rows.map((row, index) => (
              <Fragment key={row.kind}>
                {index > 0 ? <HairlineDivider /> : null}
                <InfoRow row={row} />
              </Fragment>
            ))}
          </View>
        </View>
      ) : vm.errorText ? (
        <Text accessibilityLiveRegion="polite" className="text-body text-alert">
          {vm.errorText}
        </Text>
      ) : null}
    </SheetLayout>
  );
}
