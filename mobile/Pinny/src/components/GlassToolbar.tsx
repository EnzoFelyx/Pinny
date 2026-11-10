import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassIconButton, type GlassIconTone } from './GlassIconButton';

export interface GlassToolbarAction {
  key: string;
  icon: LucideIcon;
  accessibilityLabel: string;
  onPress: () => void;
  // Cor do ícone: accent (roxo), info (azul) ou destructive (vermelho).
  tone: Exclude<GlassIconTone, 'default'>;
  // Desativado: continua visível, apagado, como os botões da barra do iOS sem seleção.
  disabled?: boolean;
}

interface GlassToolbarProps {
  // Da esquerda para a direita, espalhadas pela largura. null = vaga vazia (a ação não vale
  // agora), para as outras não mudarem de lado.
  actions: readonly (GlassToolbarAction | null)[];
}

// Ações do modo de seleção (como no Mail do iOS): círculos de Liquid Glass flutuando no pé da
// tela, por cima do conteúdo, sem fundo nem espaço próprio (a tela não encolhe). Usada pela tela
// da pasta e pelo quadro; a tela pai precisa ocupar a tela inteira.
export function GlassToolbar({ actions }: GlassToolbarProps) {
  return (
    <SafeAreaView edges={['bottom']} pointerEvents="box-none" style={styles.bar}>
      <View pointerEvents="box-none" className="flex-row items-center justify-between px-6 pb-2">
        {actions.map((action, index) =>
          action ? (
            <GlassIconButton
              key={action.key}
              icon={action.icon}
              tone={action.tone}
              accessibilityLabel={action.accessibilityLabel}
              onPress={action.onPress}
              disabled={action.disabled}
              size="large"
            />
          ) : (
            // Vaga vazia: só ocupa o lugar na distribuição.
            <View key={`empty-${index}`} />
          ),
        )}
      </View>
    </SafeAreaView>
  );
}

// SafeAreaView não aceita className (REGRAS.md, regra 5). Por cima do conteúdo, no pé da tela.
const styles = StyleSheet.create({
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0 },
});
