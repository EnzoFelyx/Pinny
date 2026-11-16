import { DatePicker, Host } from '@expo/ui/swift-ui';
import { datePickerStyle, environment, tint } from '@expo/ui/swift-ui/modifiers';
import { CalendarClock } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { SheetLayout } from '@/components/SheetLayout';
import { ptBR } from '@/i18n/pt-BR';
import { colors } from '@/theme';

import { useCardDueDateViewModel } from '../viewmodel/useCardDueDateViewModel';

const text = ptBR.card.dueDate;
// O calendário nativo segue o idioma do app (semana, meses e "Hora" em português), mesmo com o
// aparelho em outro idioma.
const pickerModifiers = [
  datePickerStyle('graphical'),
  environment('locale', 'pt_BR'),
  tint(colors.primary),
];

interface CardDueDateScreenProps {
  cardId: string;
}

// Folha "Data e horário" do cartão: o calendário nativo do iOS com o horário embaixo, "Salvar" e,
// se o cartão já tem prazo, "Remover prazo". O lembrete do Figma entra na etapa 9.
export function CardDueDateScreen({ cardId }: CardDueDateScreenProps) {
  const vm = useCardDueDateViewModel(cardId);

  return (
    <SheetLayout title={text.title} icon={CalendarClock} bottomSpace="roomy">
      {vm.selection ? (
        <Host matchContents={{ vertical: true }}>
          <DatePicker
            title={text.pickerLabel}
            selection={vm.selection}
            displayedComponents={['date', 'hourAndMinute']}
            onDateChange={vm.changeDate}
            modifiers={pickerModifiers}
          />
        </Host>
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
          <Button label={text.remove} variant="secondary" onPress={vm.remove} />
        ) : null}
      </View>
    </SheetLayout>
  );
}
