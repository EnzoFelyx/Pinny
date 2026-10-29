import { Button } from '@/components/Button';
import { ScreenPlaceholder } from '@/components/ScreenPlaceholder';
import { ptBR } from '@/i18n/pt-BR';

import { useSettingsViewModel } from '../viewmodel/useSettingsViewModel';

export function SettingsScreen() {
  const vm = useSettingsViewModel();

  return (
    <ScreenPlaceholder title={ptBR.settings.title}>
      {vm.showDeveloperTools ? (
        <Button
          label={ptBR.settings.componentGallery}
          variant="secondary"
          onPress={vm.openComponentGallery}
        />
      ) : null}
    </ScreenPlaceholder>
  );
}
