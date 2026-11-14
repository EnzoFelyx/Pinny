import { Tag } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { ColorSwatchPicker } from '@/components/ColorSwatchPicker';
import { NameSheet } from '@/components/NameSheet';
import { ptBR } from '@/i18n/pt-BR';

import { useNewLabelViewModel } from '../viewmodel/useNewLabelViewModel';

const text = ptBR.card.labels;

interface NewLabelScreenProps {
  cardId: string;
}

// Folha "Nova etiqueta": a mesma folha de nome das pastas e colunas (uma parada só, sobe junto
// com o teclado), com a cor logo abaixo do nome.
export function NewLabelScreen({ cardId }: NewLabelScreenProps) {
  const vm = useNewLabelViewModel(cardId);

  return (
    <NameSheet
      title={text.newLabel}
      label={text.nameLabel}
      icon={Tag}
      placeholder={text.namePlaceholder}
      submitLabel={text.create}
      name={vm.name}
      canSubmit={vm.canCreate}
      errorText={vm.errorText}
      onChangeName={vm.changeName}
      onSubmit={vm.create}
    >
      <View className="gap-2">
        <Text className="text-label text-text-primary">{text.colorLabel}</Text>
        <ColorSwatchPicker
          options={vm.colorOptions}
          value={vm.color}
          onChange={vm.chooseColor}
          colorLabels={text.colorA11y}
          accessibilityLabel={text.colorLabel}
        />
      </View>
    </NameSheet>
  );
}
