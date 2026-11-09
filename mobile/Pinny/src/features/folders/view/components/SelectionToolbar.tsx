import { Pin, PinOff, Trash2 } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassIconButton } from '@/components/GlassIconButton';
import { ptBR } from '@/i18n/pt-BR';

const text = ptBR.folders.folderScreen;

interface SelectionToolbarProps {
  // null = sem fixar/desafixar para a seleção atual (ex.: passaria de 3 fixados).
  pin: { accessibilityLabel: string; isUnpin: boolean } | null;
  canDelete: boolean;
  onTogglePin: () => void;
  onDelete: () => void;
}

// Botões de vidro flutuando embaixo da tela da pasta no modo "Selecionar": fixar (ou desafixar,
// alfinete riscado) à esquerda e excluir (lixeira vermelha) à direita. Cada um só aparece quando
// a ação vale para a seleção.
export function SelectionToolbar({ pin, canDelete, onTogglePin, onDelete }: SelectionToolbarProps) {
  return (
    <SafeAreaView edges={['bottom']} pointerEvents="box-none" style={styles.bar}>
      <View pointerEvents="box-none" className="flex-row items-center justify-between px-6 pb-2">
        {pin ? (
          <GlassIconButton
            icon={pin.isUnpin ? PinOff : Pin}
            tone="muted"
            accessibilityLabel={pin.accessibilityLabel}
            onPress={onTogglePin}
            size="large"
          />
        ) : (
          <View />
        )}
        {canDelete ? (
          <GlassIconButton
            icon={Trash2}
            tone="destructive"
            accessibilityLabel={text.deleteSelectedA11y}
            onPress={onDelete}
            size="large"
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

// SafeAreaView não aceita className (REGRAS.md, regra 5). Por cima da grade, no pé da tela.
const styles = StyleSheet.create({
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0 },
});
