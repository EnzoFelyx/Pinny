import { DatePicker, Host } from '@expo/ui/swift-ui';
import {
  accessibilityLabel,
  datePickerStyle,
  dynamicTypeSize,
  environment,
  tint,
} from '@expo/ui/swift-ui/modifiers';
import { CalendarClock } from 'lucide-react-native';
import { Text, useWindowDimensions, View } from 'react-native';

import { Button } from '@/components/Button';
import { HairlineDivider } from '@/components/HairlineDivider';
import { SheetLayout } from '@/components/SheetLayout';
import { useDestructiveConfirm } from '@/hooks/useDestructiveConfirm';
import { ptBR } from '@/i18n/pt-BR';
import { colors } from '@/theme';
import { oneSizeSmaller } from '@/utils/dynamicType';

import { useCardDueDateViewModel } from '../viewmodel/useCardDueDateViewModel';

const text = ptBR.card.dueDate;
// Os seletores nativos seguem o idioma do app (semana e meses em português), mesmo com o aparelho
// em outro idioma, e o roxo do app onde o iOS deixa. No iOS 26, o dia escolhido e os textos do
// calendário ficam em preto e não aceitam outra cor (nem tint nem UIDatePicker.appearance());
// o autor preferiu manter o nativo assim (2026-11-16).
const sharedModifiers = [environment('locale', 'pt_BR'), tint(colors.primary)];
const timeModifiers = [
  datePickerStyle('compact'),
  accessibilityLabel(text.timeLabel),
  ...sharedModifiers,
];

interface CardDueDateScreenProps {
  cardId: string;
}

// Folha "Data e horário" do cartão: o calendário nativo do iOS, uma linha e o horário (campo
// compacto do iOS) embaixo, "Salvar" e, se o cartão já tem prazo, "Remover prazo" (texto
// vermelho, como as remoções nos apps da Apple). Puxar para fechar com uma data nova não salva
// pede "Descartar alterações?". O lembrete do Figma entra na etapa 9.
export function CardDueDateScreen({ cardId }: CardDueDateScreenProps) {
  const vm = useCardDueDateViewModel(cardId);
  // Números do calendário um tamanho abaixo da fonte do sistema (pedido do autor, 2026-11-16).
  const { fontScale } = useWindowDimensions();
  const calendarModifiers = [
    datePickerStyle('graphical'),
    dynamicTypeSize(oneSizeSmaller(fontScale)),
    ...sharedModifiers,
  ];
  useDestructiveConfirm(vm.discardRequest, {
    onConfirm: vm.confirmDiscard,
    onCancel: vm.cancelDiscard,
  });

  return (
    <SheetLayout
      title={text.title}
      titleSize="compact"
      topSpace="roomy"
      icon={CalendarClock}
      bottomSpace="roomy"
    >
      {vm.selection ? (
        <View>
          <Host matchContents={{ vertical: true }}>
            <DatePicker
              title={text.dateLabel}
              selection={vm.selection}
              displayedComponents={['date']}
              onDateChange={vm.changeDate}
              modifiers={calendarModifiers}
            />
          </Host>
          {/* Linha entre o calendário e o horário (pedido do autor, 2026-11-16). */}
          <HairlineDivider className="mx-2 my-3" weight="regular" />
          <View className="flex-row items-center justify-between px-2 py-4">
            <Text accessibilityElementsHidden className="text-subtitle text-text-primary">
              {text.timeLabel}
            </Text>
            <Host matchContents>
              <DatePicker
                selection={vm.selection}
                displayedComponents={['hourAndMinute']}
                onDateChange={vm.changeDate}
                modifiers={timeModifiers}
              />
            </Host>
          </View>
        </View>
      ) : null}
      {vm.errorText ? (
        <Text accessibilityLiveRegion="polite" className="text-body text-alert">
          {vm.errorText}
        </Text>
      ) : null}
      {/* 24 a mais embaixo dos botões (pedido do autor, 2026-11-14): pareciam colados no fundo. */}
      <View className="mb-6 gap-3">
        <Button label={text.save} onPress={vm.save} disabled={vm.selection === null} />
        {vm.canRemove ? (
          <Button label={text.remove} variant="destructive" onPress={vm.remove} />
        ) : null}
      </View>
    </SheetLayout>
  );
}
