import { Plus, Tag } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { HairlineDivider } from '@/components/HairlineDivider';
import { Label } from '@/components/Label';
import { OptionRow } from '@/components/OptionRow';
import { SheetLayout } from '@/components/SheetLayout';
import { ptBR } from '@/i18n/pt-BR';

import { useCardLabelsViewModel } from '../viewmodel/useCardLabelsViewModel';
import { PriorityPicker } from './components/PriorityPicker';

const text = ptBR.card.labels;

interface CardLabelsScreenProps {
  cardId: string;
}

// Folha "Prioridade e etiquetas" do cartão (tudo num lugar só, pedido do autor): a prioridade
// (escolha única) e as etiquetas do quadro, cada uma com o visto quando marcada no cartão. No
// rodapé, "Nova etiqueta" abre a folha de nome e cor (com o campo no rodapé desta folha, o teclado
// expandia a folha e cobria o campo).
export function CardLabelsScreen({ cardId }: CardLabelsScreenProps) {
  const vm = useCardLabelsViewModel(cardId);

  return (
    <SheetLayout
      title={text.title}
      icon={Tag}
      footer={
        <>
          {vm.errorText ? (
            <Text accessibilityLiveRegion="polite" className="text-body text-alert">
              {vm.errorText}
            </Text>
          ) : null}
          {/* Primário: o secundário tinha o mesmo lavanda das etiquetas marcadas (pedido do autor). */}
          <Button label={text.newLabel} icon={Plus} onPress={vm.openNewLabel} />
        </>
      }
    >
      <HairlineDivider />

      <View className="gap-2">
        <Text className="text-label text-text-primary">{text.priorityLabel}</Text>
        <PriorityPicker
          options={vm.priorityOptions}
          onChange={vm.setPriority}
          noneLabel={text.noPriority}
          accessibilityLabel={text.priorityLabel}
        />
      </View>

      <HairlineDivider />

      <View className="gap-1">
        <Text className="pb-1 text-label text-text-primary">{text.labelsLabel}</Text>
        {vm.emptyText ? (
          <Text className="text-body text-text-secondary">{vm.emptyText}</Text>
        ) : null}
        {vm.options.map((option) => (
          <OptionRow
            key={option.id}
            label={ptBR.card.labelA11y(option.name)}
            isSelected={option.isSelected}
            onPress={() => vm.toggle(option.id)}
            isMultiple
            content={<Label name={option.name} color={option.color} />}
          />
        ))}
      </View>
    </SheetLayout>
  );
}
