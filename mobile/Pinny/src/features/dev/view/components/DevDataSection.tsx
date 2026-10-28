import { Text } from 'react-native';

import { Button } from '@/components/Button';
import { ptBR } from '@/i18n/pt-BR';

import { galleryText } from '../../model/gallerySamples';
import { useDevDataViewModel } from '../../viewmodel/useDevDataViewModel';
import { GallerySection } from './GallerySection';

const text = galleryText.data;

// Conferência manual da camada de dados (etapa 4), já que os testes estão adiados.
export function DevDataSection() {
  const vm = useDevDataViewModel();

  return (
    <GallerySection title={galleryText.sections.data}>
      <Text className="text-body text-text-primary">{vm.summaryText}</Text>
      {vm.feedback ? (
        <Text accessibilityLiveRegion="polite" className="text-caption text-text-secondary">
          {vm.feedback}
        </Text>
      ) : null}
      <Button label={text.seed} onPress={vm.seed} />
      <Button label={text.move} variant="secondary" onPress={vm.moveFirstCard} />
      <Button label={text.delete} variant="secondary" onPress={vm.deleteFirstCard} />
      <Button
        label={ptBR.common.undo}
        variant="secondary"
        disabled={!vm.canUndo}
        onPress={vm.undo}
      />
      <Button label={text.clear} variant="ghost" onPress={vm.clearAll} />
      <Text className="text-caption text-text-secondary">{text.hint}</Text>
    </GallerySection>
  );
}
