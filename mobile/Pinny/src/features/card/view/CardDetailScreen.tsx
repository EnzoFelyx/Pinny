import { Plus } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DeadlineChip } from '@/components/DeadlineChip';
import { Label } from '@/components/Label';
import { PriorityChip } from '@/components/PriorityChip';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useDestructiveConfirm } from '@/hooks/useDestructiveConfirm';
import { ptBR } from '@/i18n/pt-BR';
import { colors } from '@/theme';

import { useCardDetailViewModel } from '../viewmodel/useCardDetailViewModel';
import { CardDetailMenu } from './components/CardDetailMenu';
import { ChecklistSection } from './components/ChecklistSection';
import { CommitTextField } from './components/CommitTextField';
import { DueDateBlock } from './components/DueDateBlock';
import { PhotoSection } from './components/PhotoSection';

const text = ptBR.card.detail;
// O título do topo é fixo ("Seu cartão"): não renomeia (o nome do cartão é editado no campo).
const cardTitleLabels = { action: text.screenTitle, hint: '', input: text.titleLabel };
const ADD_ICON_SIZE = 20;
// O botão tem 28; o hitSlop completa a área de toque de 44.
const ADD_HIT_SLOP = 8;

interface CardDetailScreenProps {
  cardId: string;
}

// Tela do cartão (Figma "Cartão · Proposta para a Marina"): o topo "Seu cartão" com o caminho
// (pasta / coluna), o voltar e o "…"; título, etiquetas, prioridade e prazo, descrição, status,
// checklist e fotos.
// Tudo grava na hora. Escolher opções (prioridade, etiquetas, coluna) abre folhas por cima.
export function CardDetailScreen({ cardId }: CardDetailScreenProps) {
  const vm = useCardDetailViewModel(cardId);
  useDestructiveConfirm(vm.deleteRequest, {
    onConfirm: vm.confirmDelete,
    onCancel: vm.cancelDelete,
  });
  useDestructiveConfirm(vm.photos.deleteRequest, {
    onConfirm: vm.photos.confirmDelete,
    onCancel: vm.photos.cancelDelete,
  });
  useDestructiveConfirm(vm.photos.cameraDeniedRequest, {
    onConfirm: vm.photos.openSettings,
    onCancel: vm.photos.dismissCameraDenied,
  });

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <ScreenHeader
        title={text.screenTitle}
        subtitle={vm.breadcrumb}
        isLoading={vm.isLoading}
        errorText={vm.errorText}
        onBack={vm.goBack}
        renameLabels={cardTitleLabels}
        renderMenu={() =>
          vm.isLoading ? null : (
            <CardDetailMenu
              onMove={vm.openMove}
              onArchive={vm.archive}
              onDelete={vm.requestDelete}
            />
          )
        }
      />
      {vm.isLoading ? null : (
        <ScrollView
          automaticallyAdjustKeyboardInsets
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="gap-5 px-6 pb-10"
        >
          <CommitTextField
            value={vm.title}
            onCommit={vm.renameTitle}
            isRequired
            multiline
            accessibilityLabel={text.titleLabel}
            placeholder={text.titlePlaceholder}
            className="text-display text-text-primary"
          />

          {/* Etiquetas, prioridade, prazo e o "+" do Figma: tocar nas etiquetas, na prioridade ou no
          "+" abre a folha "Prioridade e etiquetas". */}
          <View className="flex-row flex-wrap items-center gap-2">
            <Pressable
              accessibilityRole="button"
              accessibilityHint={text.editTagsHint}
              onPress={vm.openLabels}
              className="flex-row flex-wrap items-center gap-2 active:opacity-60"
            >
              {vm.labels.map((label) => (
                <Label key={label.id} name={label.name} color={label.color} />
              ))}
              {vm.priority ? <PriorityChip priority={vm.priority} /> : null}
            </Pressable>
            {vm.deadline ? <DeadlineChip deadline={vm.deadline} /> : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={text.add}
              onPress={vm.openLabels}
              hitSlop={ADD_HIT_SLOP}
              className="h-7 w-7 items-center justify-center rounded-full active:opacity-60"
            >
              <Plus size={ADD_ICON_SIZE} color={colors.textSecondary} />
            </Pressable>
          </View>

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

          <DueDateBlock
            value={vm.dueDate}
            addLabel={text.addDue}
            editHint={text.dueEditHint}
            onPress={vm.openDueDate}
          />

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

          <ChecklistSection checklist={vm.checklist} />
          <PhotoSection photos={vm.photos} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// SafeAreaView não aceita className (REGRAS.md, regra 5).
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
});
