import { Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { SheetLayout } from '@/components/SheetLayout';
import { ptBR } from '@/i18n/pt-BR';

import { useMoveCardViewModel } from '../viewmodel/useMoveCardViewModel';
import { OptionRow } from '@/components/OptionRow';

const text = ptBR.board.moveSheet;

interface MoveCardScreenProps {
  cardId: string;
}

export function MoveCardScreen({ cardId }: MoveCardScreenProps) {
  const vm = useMoveCardViewModel(cardId);

  return (
    <SheetLayout title={text.title}>
      <View accessibilityRole="radiogroup" accessibilityLabel={text.columnLabel} className="gap-1">
        <Text className="pb-1 text-label text-text-secondary">{text.columnLabel}</Text>
        {vm.columnOptions.map((option) => (
          <OptionRow
            key={option.value}
            label={option.label}
            isSelected={option.isSelected}
            onPress={() => vm.selectColumn(option.value)}
          />
        ))}
      </View>
      {vm.errorText ? (
        <Text accessibilityLiveRegion="polite" className="text-body text-alert">
          {vm.errorText}
        </Text>
      ) : null}
      <Button label={text.submit} disabled={!vm.canMove} onPress={vm.move} />
    </SheetLayout>
  );
}
