import { Text } from 'react-native';

import { Button } from '@/components/Button';
import { ScreenPlaceholder } from '@/components/ScreenPlaceholder';
import { ptBR } from '@/i18n/pt-BR';

import { useSettingsViewModel } from '../viewmodel/useSettingsViewModel';

const text = ptBR.settings;

export function SettingsScreen() {
  const vm = useSettingsViewModel();

  return (
    <ScreenPlaceholder title={text.title}>
      {vm.showDeveloperTools ? (
        <>
          <Button
            label={text.componentGallery}
            variant="secondary"
            onPress={vm.openComponentGallery}
          />
          <Button
            label={text.stressHeavy}
            variant="secondary"
            disabled={vm.isSeeding}
            onPress={vm.createHeavyBoard}
          />
          <Button
            label={text.stressExtreme}
            variant="secondary"
            disabled={vm.isSeeding}
            onPress={vm.createExtremeBoard}
          />
          {vm.devFeedback ? (
            <Text
              accessibilityLiveRegion="polite"
              className="text-center text-caption text-text-secondary"
            >
              {vm.devFeedback}
            </Text>
          ) : null}
        </>
      ) : null}
    </ScreenPlaceholder>
  );
}
