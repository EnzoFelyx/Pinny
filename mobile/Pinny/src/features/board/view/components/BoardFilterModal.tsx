import { X } from 'lucide-react-native';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Label } from '@/components/Label';
import { PriorityChip } from '@/components/PriorityChip';
import { ptBR } from '@/i18n/pt-BR';
import { colors } from '@/theme';

import type { BoardFilterViewModel } from '../../viewmodel/useBoardFilter';
import { CheckChoice, FilterSection, RadioChoice, ToggleOption } from './FilterControls';

const text = ptBR.board.filter;
const CLOSE_ICON_SIZE = 20;
// O botão de fechar tem 36pt (Figma); o hitSlop completa os 44pt de área de toque.
const CLOSE_HIT_SLOP = 4;

interface BoardFilterModalProps {
  filter: BoardFilterViewModel;
}

// Modal "Filtrar" do quadro, centralizado sobre o quadro escurecido (Figma "Filter panel open",
// adaptado de folha para modal a pedido do autor). Tocar fora ou no "X" fecha sem aplicar.
export function BoardFilterModal({ filter }: BoardFilterModalProps) {
  return (
    <Modal
      visible={filter.isOpen}
      transparent
      animationType="fade"
      onRequestClose={filter.close}
      statusBarTranslucent
    >
      <View className="flex-1 justify-center bg-overlay px-6">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={text.close}
          onPress={filter.close}
          style={StyleSheet.absoluteFill}
        />
        <View
          accessibilityViewIsModal
          className="max-h-[85%] rounded-[24px] bg-surface shadow-lifted"
        >
          <ScrollView bounces={false} contentContainerClassName="gap-[18px] p-6">
            <View className="h-9 flex-row items-center justify-between">
              <Text accessibilityRole="header" className="text-title text-text-primary">
                {text.title}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={text.close}
                hitSlop={CLOSE_HIT_SLOP}
                onPress={filter.close}
                className="h-9 w-9 items-center justify-center active:opacity-60"
              >
                <X size={CLOSE_ICON_SIZE} color={colors.textSecondary} />
              </Pressable>
            </View>

            {/* Um pouco mais de respiro entre as três seções de escolha. */}
            <View className="gap-6">
              <FilterSection title={text.deadline}>
                <View accessibilityRole="radiogroup" className="flex-row flex-wrap gap-1.5">
                  {filter.deadlineOptions.map((option) => (
                    <RadioChoice
                      key={option.value}
                      label={option.label}
                      isSelected={option.isSelected}
                      onSelect={() => filter.selectDeadline(option.value)}
                    />
                  ))}
                </View>
              </FilterSection>

              <FilterSection title={text.priority}>
                <View className="flex-row flex-wrap gap-x-2.5">
                  {filter.priorityOptions.map((option) => (
                    <CheckChoice
                      key={option.priority}
                      accessibilityLabel={option.accessibilityLabel}
                      isSelected={option.isSelected}
                      onToggle={() => filter.togglePriority(option.priority)}
                    >
                      <PriorityChip priority={option.priority} />
                    </CheckChoice>
                  ))}
                </View>
              </FilterSection>

              <FilterSection title={text.labels}>
                {filter.labelOptions.length > 0 ? (
                  <View className="flex-row flex-wrap gap-x-2.5">
                    {filter.labelOptions.map((option) => (
                      <CheckChoice
                        key={option.id}
                        accessibilityLabel={option.accessibilityLabel}
                        isSelected={option.isSelected}
                        onToggle={() => filter.toggleLabel(option.id)}
                      >
                        <Label name={option.name} color={option.color} />
                      </CheckChoice>
                    ))}
                  </View>
                ) : (
                  <Text className="text-body text-text-secondary">{text.noLabels}</Text>
                )}
              </FilterSection>
            </View>

            <View>
              <ToggleOption
                label={text.showCompleted}
                value={filter.showCompleted}
                onValueChange={filter.setShowCompleted}
              />
              <ToggleOption
                label={text.onlyPendingChecklist}
                value={filter.onlyPendingChecklist}
                onValueChange={filter.setOnlyPendingChecklist}
              />
            </View>

            <View className="flex-row items-center gap-3">
              <View className="w-[104px]">
                <Button label={text.clear} variant="ghost" onPress={filter.clear} />
              </View>
              <View className="flex-1">
                <Button label={filter.applyText} onPress={filter.apply} />
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
