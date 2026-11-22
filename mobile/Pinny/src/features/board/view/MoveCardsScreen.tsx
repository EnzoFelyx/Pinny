import { ChevronRight, FolderInput } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { SheetLayout } from '@/components/SheetLayout';
import { ptBR } from '@/i18n/pt-BR';
import { colors } from '@/theme';

import { useMoveCardsViewModel } from '../viewmodel/useMoveCardsViewModel';
import { OptionRow } from '@/components/OptionRow';

const text = ptBR.board.moveCardsSheet;
const CHEVRON_SIZE = 16;

interface MoveCardsScreenProps {
  boardId: string;
  cardIds: readonly string[];
}

// Folha nativa "Mover N cartões para:": o quadro (com "Trocar", que mostra os quadros por pasta)
// e as colunas dele. Os cartões vão para o fim da coluna escolhida.
export function MoveCardsScreen({ boardId, cardIds }: MoveCardsScreenProps) {
  const vm = useMoveCardsViewModel(boardId, cardIds);

  return (
    <SheetLayout
      title={vm.title}
      icon={FolderInput}
      footer={
        <>
          {vm.errorText ? (
            <Text accessibilityLiveRegion="polite" className="text-body text-alert">
              {vm.errorText}
            </Text>
          ) : null}
          <Button label={text.submit} disabled={!vm.canMove} onPress={vm.move} />
        </>
      }
    >
      {vm.isPickingBoard ? (
        <View className="gap-4">
          {vm.boardGroups.map((group) => (
            <View
              key={group.id}
              accessibilityRole="radiogroup"
              accessibilityLabel={group.title}
              className="gap-1"
            >
              <Text className="pb-1 text-label text-text-secondary">{group.title}</Text>
              {group.options.map((option) => (
                <OptionRow
                  key={option.value}
                  label={option.label}
                  isSelected={option.isSelected}
                  onPress={() => vm.selectBoard(option.value)}
                  size="large"
                />
              ))}
            </View>
          ))}
        </View>
      ) : (
        <View className="gap-4">
          <View className="gap-1">
            <Text className="pb-1 text-label text-text-secondary">{text.boardLabel}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={text.changeBoardA11y(vm.boardTitle)}
              onPress={vm.startPickingBoard}
              className="min-h-14 flex-row items-center justify-between gap-3 rounded-[16px] bg-column-background px-4 py-3.5 active:opacity-60"
            >
              <Text numberOfLines={1} className="shrink text-card-title text-text-primary">
                {vm.boardTitle}
              </Text>
              <View className="flex-row items-center gap-0.5">
                <Text className="text-label text-on-secondary">{text.changeBoard}</Text>
                <ChevronRight size={CHEVRON_SIZE} color={colors.onSecondary} />
              </View>
            </Pressable>
          </View>
          <View
            accessibilityRole="radiogroup"
            accessibilityLabel={text.columnLabel}
            className="gap-1"
          >
            <Text className="pb-1 text-label text-text-secondary">{text.columnLabel}</Text>
            {vm.columnOptions.map((option) => (
              <OptionRow
                key={option.value}
                label={option.label}
                isSelected={option.isSelected}
                onPress={() => vm.selectColumn(option.value)}
                size="large"
              />
            ))}
          </View>
        </View>
      )}
    </SheetLayout>
  );
}
