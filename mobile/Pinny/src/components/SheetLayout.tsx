import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useSheetFitDetent } from '@/hooks/useSheetFitDetent';
import { colors } from '@/theme';

interface SheetLayoutProps {
  title: string;
  // Ícone opcional antes do título (decorativo: o título já diz o que a folha faz).
  icon?: LucideIcon;
  children: ReactNode;
  // Folha com lista longa: o conteúdo rola entre o título e o rodapé, que ficam sempre à vista.
  // A folha abre com a altura do conteúdo (entre SCROLLABLE_HEIGHT.min e .max da tela) e expande
  // para a tela toda ao puxar. Sem ele, a folha tem a altura do conteúdo.
  footer?: ReactNode;
}

const ICON_SIZE = 24;
// Fração da altura da tela: abre com o tamanho do conteúdo, no mínimo 40% e no máximo 60%.
const SCROLLABLE_HEIGHT = { min: 0.4, max: 0.6 } as const;
// O pt-8 do topo da folha com lista, que entra na conta da altura do conteúdo.
const SCROLLABLE_TOP_PADDING = 32;

// Conteúdo de uma folha nativa do iOS (rota com presentation "formSheet", ver app/_layout.tsx).
// A altura da folha acompanha o conteúdo; com footer, abre entre 40% e 60% da tela, expande para
// a tela toda e o conteúdo rola. O arraste para fechar e o puxador são do sistema.
export function SheetLayout({ title, icon: Icon, children, footer }: SheetLayoutProps) {
  const fit = useSheetFitDetent(SCROLLABLE_HEIGHT, SCROLLABLE_TOP_PADDING);
  const header = (
    // items-start: com o título em duas linhas, o ícone fica na primeira. O mt centraliza o ícone
    // (24) na altura da linha do text-title (22 × 1,35 ≈ 30).
    <View className="flex-row items-start gap-2.5">
      {Icon ? (
        <View className="mt-[3px]">
          <Icon size={ICON_SIZE} color={colors.onSecondary} />
        </View>
      ) : null}
      <Text accessibilityRole="header" className="flex-1 text-title text-text-primary">
        {title}
      </Text>
    </View>
  );

  if (footer === undefined) {
    return (
      <View className="gap-[18px] px-6 pb-3 pt-8">
        {header}
        {children}
      </View>
    );
  }

  // A folha nativa (react-native-screens) espera a lista num contêiner com no máximo 2 filhos:
  // título + lista. collapsable={false} impede o React Native de achatar essas views (senão a
  // lista é posicionada por cima do título). O rodapé fica fora desse contêiner.
  return (
    <View collapsable={false} className="flex-1 pt-8">
      <View collapsable={false} className="flex-1">
        <View collapsable={false} onLayout={fit.onHeaderLayout} className="px-6 pb-4">
          {header}
        </View>
        <ScrollView
          className="flex-1"
          onContentSizeChange={fit.onListContentSizeChange}
          contentInsetAdjustmentBehavior="never"
          contentContainerClassName="gap-[18px] px-6 pb-4"
        >
          {children}
        </ScrollView>
      </View>
      {/* Fundo próprio e linha fina em cima: a lista não aparece passando por trás do botão. Só
          4 de espaço em cima e embaixo do botão. */}
      <View
        collapsable={false}
        onLayout={fit.onFooterLayout}
        style={styles.footer}
        className="gap-3 bg-surface px-6 py-1"
      >
        {footer}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
});
