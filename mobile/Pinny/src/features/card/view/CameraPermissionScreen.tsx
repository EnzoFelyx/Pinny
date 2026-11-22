import { Camera } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { SheetLayout } from '@/components/SheetLayout';
import { ptBR } from '@/i18n/pt-BR';

import { useCameraPermissionViewModel } from '../viewmodel/useCameraPermissionViewModel';

const text = ptBR.card.cameraPermission;

// Explicação curta antes do pedido de permissão da câmera do iOS (CLAUDE.md, seção 12, regra 6):
// uma frase com o porquê e que a foto fica só no celular. "Agora não" fica visível, sem culpar
// ninguém (regra 9).
export function CameraPermissionScreen() {
  const vm = useCameraPermissionViewModel();

  return (
    <SheetLayout title={text.title} icon={Camera} bottomSpace="roomy">
      <Text className="text-body text-text-primary">{text.message}</Text>
      <View className="gap-3">
        <Button label={text.continue} onPress={vm.allow} disabled={vm.isAsking} />
        <Button label={text.notNow} variant="ghost" onPress={vm.dismiss} />
      </View>
    </SheetLayout>
  );
}
