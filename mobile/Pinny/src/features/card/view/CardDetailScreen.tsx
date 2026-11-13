import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { DeadlineChip } from '@/components/DeadlineChip';
import { Label } from '@/components/Label';
import { PriorityChip } from '@/components/PriorityChip';
import { useDestructiveConfirm } from '@/hooks/useDestructiveConfirm';
import { type SheetDetentPolicy, useSheetFitDetent } from '@/hooks/useSheetFitDetent';
import { ptBR } from '@/i18n/pt-BR';

import { useCardDetailViewModel } from '../viewmodel/useCardDetailViewModel';
import { CardDetailMenu } from './components/CardDetailMenu';
import { CommitTextField } from './components/CommitTextField';

const text = ptBR.card.detail;

// A folha abre na altura do conteúdo de cada cartão (sem sobrar espaço em branco), até 90% da
// tela; cartão maior rola por dentro. Puxar leva à tela toda (pedido do autor, 2026-11-13).
const DETAIL_SHEET_POLICY: SheetDetentPolicy = { min: 0.25, max: 0.9, expandable: true };

interface CardDetailScreenProps {
  cardId: string;
}

// Folha do detalhe do cartão (Figma "Cartão · Proposta para a Marina", em folha nativa por decisão
// do autor): caminho (pasta / coluna) e "…", título, etiquetas, prioridade e prazo, descrição e
// status. Tudo grava na hora.
export function CardDetailScreen({ cardId }: CardDetailScreenProps) {
  const vm = useCardDetailViewModel(cardId);
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  useSheetFitDetent(contentHeight, DETAIL_SHEET_POLICY);
  useDestructiveConfirm(vm.deleteRequest, {
    onConfirm: vm.confirmDelete,
    onCancel: vm.cancelDelete,
  });

  if (vm.isLoading) return null;
  const hasTags = vm.labels.length > 0 || vm.priority !== undefined || vm.deadline !== undefined;

  return (
    <ScrollView
      automaticallyAdjustKeyboardInsets
      onContentSizeChange={(_width, height) => setContentHeight(height)}
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="gap-5 px-6 pb-10 pt-6"
    >
      <View className="flex-row items-center gap-3">
        <Text className="flex-1 text-caption text-text-secondary" numberOfLines={1}>
          {vm.breadcrumb}
        </Text>
        <CardDetailMenu onMove={vm.openMove} onArchive={vm.archive} onDelete={vm.requestDelete} />
      </View>

      {vm.errorText ? (
        <Text accessibilityLiveRegion="polite" className="text-body text-alert">
          {vm.errorText}
        </Text>
      ) : null}

      <CommitTextField
        value={vm.title}
        onCommit={vm.renameTitle}
        isRequired
        multiline
        accessibilityLabel={text.titleLabel}
        placeholder={text.titlePlaceholder}
        className="-mt-2 text-display text-text-primary"
      />

      {hasTags ? (
        <View className="flex-row flex-wrap items-center gap-2">
          {vm.labels.map((label) => (
            <Label key={label.id} name={label.name} color={label.color} />
          ))}
          {vm.priority ? <PriorityChip priority={vm.priority} /> : null}
          {vm.deadline ? <DeadlineChip deadline={vm.deadline} /> : null}
        </View>
      ) : null}

      <View className="gap-1.5">
        <Text className="text-label text-text-primary">{text.descriptionLabel}</Text>
        <CommitTextField
          value={vm.description}
          onCommit={vm.changeDescription}
          multiline
          accessibilityLabel={text.descriptionLabel}
          placeholder={text.descriptionPlaceholder}
          className="text-body text-text-secondary"
        />
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="text-label text-text-primary">{text.statusLabel}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={vm.statusA11y}
          onPress={vm.openMove}
          hitSlop={8}
          className="rounded-full bg-baby-blue px-3 py-1.5 active:opacity-60"
        >
          <Text className="text-tag text-text-primary">{vm.statusText}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
