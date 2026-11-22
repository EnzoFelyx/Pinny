import { Button } from '@expo/ui/swift-ui';
import { Image, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassMenu } from '@/components/GlassMenu';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useDestructiveConfirm } from '@/hooks/useDestructiveConfirm';
import { ptBR } from '@/i18n/pt-BR';
import { colors } from '@/theme';

import { useCardPhotoViewModel } from '../viewmodel/useCardPhotoViewModel';

const text = ptBR.card.photos;
// O título "Foto" é fixo (não renomeia).
const photoTitleLabels = { action: text.viewerTitle, hint: '', input: text.viewerTitle };

interface CardPhotoScreenProps {
  attachmentId: string;
}

// Foto anexada em tela cheia, inteira (sem cortar), com o voltar e o "…" (Apagar).
export function CardPhotoScreen({ attachmentId }: CardPhotoScreenProps) {
  const vm = useCardPhotoViewModel(attachmentId);
  useDestructiveConfirm(vm.deleteRequest, {
    onConfirm: vm.confirmDelete,
    onCancel: vm.cancelDelete,
  });

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <ScreenHeader
        title={vm.title}
        subtitle={vm.subtitle}
        isLoading={vm.isLoading}
        errorText={vm.errorText}
        onBack={vm.goBack}
        renameLabels={photoTitleLabels}
        renderMenu={() =>
          vm.isLoading ? null : (
            <GlassMenu accessibilityLabel={text.options}>
              <Button
                label={text.delete}
                systemImage="trash"
                role="destructive"
                onPress={vm.requestDelete}
              />
            </GlassMenu>
          )
        }
      />
      <View className="flex-1 px-4 pb-4">
        {vm.photoUri ? (
          <Image
            source={{ uri: vm.photoUri }}
            accessible
            accessibilityRole="image"
            accessibilityLabel={vm.photoA11y}
            resizeMode="contain"
            className="flex-1 rounded-[18px]"
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

// SafeAreaView não aceita className (REGRAS.md, regra 5).
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
});
