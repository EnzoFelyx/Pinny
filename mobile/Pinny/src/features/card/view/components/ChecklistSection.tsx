import { Plus } from 'lucide-react-native';
import { useState } from 'react';
import { type AccessibilityActionEvent, Text, TextInput, View } from 'react-native';

import { Checkbox } from '@/components/Checkbox';
import { ProgressBar } from '@/components/ProgressBar';
import { ptBR } from '@/i18n/pt-BR';
import { colors } from '@/theme';

import type { CardChecklistViewModel, ChecklistItemView } from '../../viewmodel/useCardChecklist';
import { CommitTextField } from './CommitTextField';

const text = ptBR.card.steps;
const ADD_ICON_SIZE = 20;
const DELETE_ACTION = 'delete';
const itemActions = [{ name: DELETE_ACTION, label: text.deleteItem }];

const itemTextClass = {
  done: 'flex-1 text-body text-text-secondary',
  pending: 'flex-1 text-body text-text-primary',
} as const;

interface ChecklistRowProps {
  item: ChecklistItemView;
  checklist: CardChecklistViewModel;
}

function ChecklistRow({ item, checklist }: ChecklistRowProps) {
  const handleAction = (event: AccessibilityActionEvent) => {
    if (event.nativeEvent.actionName === DELETE_ACTION) checklist.remove(item.id);
  };
  return (
    <View className="min-h-11 flex-row items-center gap-3">
      <Checkbox
        checked={item.isDone}
        onToggle={() => checklist.toggle(item.id, !item.isDone)}
        accessibilityLabel={item.accessibilityLabel}
      />
      <CommitTextField
        value={item.text}
        onCommit={(value) => checklist.rename(item.id, value)}
        multiline
        accessibilityLabel={text.itemTextLabel}
        accessibilityHint={text.itemHint}
        accessibilityActions={itemActions}
        onAccessibilityAction={handleAction}
        className={itemTextClass[item.isDone ? 'done' : 'pending']}
      />
    </View>
  );
}

// Campo do fim da lista: "OK" do teclado adiciona o passo e deixa o campo pronto para o próximo
// (como no app Lembretes); sair do campo com texto também adiciona.
function AddStepRow({ onAdd }: { onAdd: (value: string) => void }) {
  const [draft, setDraft] = useState('');
  const commit = () => {
    if (!draft.trim()) return;
    onAdd(draft);
    setDraft('');
  };
  return (
    <View className="min-h-11 flex-row items-center gap-3">
      <View className="h-[22px] w-[22px] items-center justify-center">
        <Plus size={ADD_ICON_SIZE} color={colors.textSecondary} />
      </View>
      <TextInput
        value={draft}
        onChangeText={setDraft}
        onSubmitEditing={commit}
        onBlur={commit}
        submitBehavior="submit"
        returnKeyType="done"
        accessibilityLabel={text.addLabel}
        placeholder={text.addPlaceholder}
        placeholderTextColor={colors.textSecondary}
        selectionColor={colors.primary}
        className="flex-1 text-body text-text-primary"
      />
    </View>
  );
}

interface ChecklistSectionProps {
  checklist: CardChecklistViewModel;
}

// Checklist do cartão (Figma "Um passo de cada vez"): título com "2 de 3", a barra de progresso,
// os passos (marcar, renomear no lugar; texto vazio apaga) e o campo para adicionar.
export function ChecklistSection({ checklist }: ChecklistSectionProps) {
  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text accessibilityRole="header" className="text-subtitle text-text-primary">
          {checklist.title}
        </Text>
        {checklist.hasItems ? (
          <Text
            accessibilityLabel={checklist.progressA11y}
            className="text-label text-on-secondary"
          >
            {checklist.progressText}
          </Text>
        ) : null}
      </View>
      {checklist.hasItems ? (
        <ProgressBar progress={checklist.progress} accessibilityLabel={checklist.progressA11y} />
      ) : (
        <Text className="text-body text-text-secondary">{text.empty}</Text>
      )}
      <View>
        {checklist.items.map((item) => (
          <ChecklistRow key={item.id} item={item} checklist={checklist} />
        ))}
        <AddStepRow onAdd={checklist.add} />
      </View>
    </View>
  );
}
