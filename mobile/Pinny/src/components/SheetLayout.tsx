import type { LucideIcon } from 'lucide-react-native';
import { type ReactNode, useState } from 'react';
import { type LayoutChangeEvent, ScrollView, StyleSheet, Text, View } from 'react-native';

import { type SheetDetentPolicy, useSheetFitDetent } from '@/hooks/useSheetFitDetent';
import { colors } from '@/theme';

export type SheetBottomSpace = 'compact' | 'roomy';
export type SheetTitleSize = 'regular' | 'compact';
export type SheetTopSpace = 'regular' | 'roomy';

// Espaço entre o topo da folha e o título (folha sem footer). roomy = 14 a mais (46), pedido do
// autor para a folha "Data e horário" (2026-11-16).
const topSpaceClass: Record<SheetTopSpace, string> = {
  regular: 'pt-8',
  roomy: 'pt-[46px]',
};

const titleClass: Record<SheetTitleSize, string> = {
  regular: 'text-title',
  compact: 'text-header-title',
};

// Centraliza o ícone (24) na altura da primeira linha do título (22 ou 20 × 1,35).
const iconOffsetClass: Record<SheetTitleSize, string> = {
  regular: 'mt-[3px]',
  compact: 'mt-[1.5px]',
};

interface SheetLayoutProps {
  title: string;
  // compact = título um pouco menor (text-header-title, 20), para folhas com muito conteúdo
  // nativo (ex.: "Data e horário").
  titleSize?: SheetTitleSize;
  // Espaço acima do título (só na folha sem footer).
  topSpace?: SheetTopSpace;
  // Ícone opcional antes do título (decorativo: o título já diz o que a folha faz).
  icon?: LucideIcon;
  children: ReactNode;
  // Folha com lista longa: o conteúdo rola entre o título e o rodapé, que ficam sempre à vista.
  // A folha abre com a altura do conteúdo (entre 40% e 60% da tela) e expande para a tela toda ao
  // puxar. Sem ele, a folha tem a altura exata do conteúdo e não expande.
  footer?: ReactNode;
  // Espaço depois do último item (folha sem footer). roomy = 32pt (~100px no print do iPhone),
  // para o botão não ficar colado na borda de baixo (folhas de nome).
  bottomSpace?: SheetBottomSpace;
}

const ICON_SIZE = 24;
// Folha com lista: abre com o tamanho do conteúdo, no mínimo 40% e no máximo 60% da tela.
const SCROLLABLE_POLICY: SheetDetentPolicy = { min: 0.4, max: 0.6, expandable: true };
// Folha simples: exatamente a altura do conteúdo, sem expandir.
const FIT_POLICY: SheetDetentPolicy = { min: 0, max: 1, expandable: false };
// O pt-8 do topo da folha com lista, que entra na conta da altura do conteúdo.
const SCROLLABLE_TOP_PADDING = 32;

const bottomSpaceClass: Record<SheetBottomSpace, string> = {
  compact: 'pb-3',
  roomy: 'pb-8',
};

// Partes medidas da folha com lista (a lista pela altura do conteúdo, não da área visível).
interface ScrollableHeights {
  header: number;
  list: number;
  footer: number;
}

function measured(event: LayoutChangeEvent): number {
  return event.nativeEvent.layout.height;
}

// Conteúdo de uma folha nativa do iOS (rota com presentation "formSheet", ver app/_layout.tsx).
// A folha mede o conteúdo e fica do tamanho dele (useSheetFitDetent); com footer, entre 40% e 60%
// da tela, expandindo para a tela toda, e o conteúdo rola. O arraste e o puxador são do sistema.
export function SheetLayout({
  title,
  titleSize = 'regular',
  topSpace = 'regular',
  icon: Icon,
  children,
  footer,
  bottomSpace = 'compact',
}: SheetLayoutProps) {
  const isScrollable = footer !== undefined;
  const [fitHeight, setFitHeight] = useState<number | null>(null);
  const [parts, setParts] = useState<ScrollableHeights | null>(null);
  const contentHeight = isScrollable
    ? parts && SCROLLABLE_TOP_PADDING + parts.header + parts.list + parts.footer
    : fitHeight;
  useSheetFitDetent(contentHeight, isScrollable ? SCROLLABLE_POLICY : FIT_POLICY);

  const setPart = (part: keyof ScrollableHeights, height: number) =>
    setParts((current) => {
      const base = current ?? { header: 0, list: 0, footer: 0 };
      return base[part] === height ? current : { ...base, [part]: height };
    });

  const header = (
    // items-start: com o título em duas linhas, o ícone fica na primeira. O mt centraliza o ícone
    // (24) na altura da linha do text-title (22 × 1,35 ≈ 30).
    <View className="flex-row items-start gap-2.5">
      {Icon ? (
        <View className={iconOffsetClass[titleSize]}>
          <Icon size={ICON_SIZE} color={colors.onSecondary} />
        </View>
      ) : null}
      <Text
        accessibilityRole="header"
        className={`flex-1 text-text-primary ${titleClass[titleSize]}`}
      >
        {title}
      </Text>
    </View>
  );

  if (!isScrollable) {
    return (
      <View
        onLayout={(event) => setFitHeight(measured(event))}
        className={`gap-[18px] px-6 ${topSpaceClass[topSpace]} ${bottomSpaceClass[bottomSpace]}`}
      >
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
        <View
          collapsable={false}
          onLayout={(event) => setPart('header', measured(event))}
          className="px-6 pb-4"
        >
          {header}
        </View>
        <ScrollView
          className="flex-1"
          onContentSizeChange={(_width, height) => setPart('list', height)}
          contentInsetAdjustmentBehavior="never"
          contentContainerClassName="gap-[18px] px-6 pb-4"
        >
          {children}
        </ScrollView>
      </View>
      {/* Fundo próprio e linha fina em cima: a lista não aparece passando por trás do botão. 20 de
          espaço em cima e embaixo do botão (py-5). */}
      <View
        collapsable={false}
        onLayout={(event) => setPart('footer', measured(event))}
        style={styles.footer}
        className="gap-3 bg-surface px-6 py-5"
      >
        {footer}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
});
