import { useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { type LayoutChangeEvent, useWindowDimensions } from 'react-native';

// Fração da tela da primeira parada da folha (o conteúdo inteiro, entre min e max) e a parada de
// tela toda, para o usuário expandir puxando.
interface FitDetentRange {
  min: number;
  max: number;
}

const FULL_SCREEN_DETENT = 1;
// Arredonda a fração (centésimos) para não trocar as paradas a cada pixel medido.
const DETENT_PRECISION = 100;

// Folha nativa com lista longa: mede o conteúdo (título, lista e rodapé) e ajusta as paradas da
// folha para [altura do conteúdo, tela toda], com a primeira limitada entre range.min e range.max.
export function useSheetFitDetent(range: FitDetentRange, fixedHeight: number) {
  const navigation = useNavigation();
  const { height: windowHeight } = useWindowDimensions();
  const [heights, setHeights] = useState({ header: 0, list: 0, footer: 0 });

  const contentHeight = fixedHeight + heights.header + heights.list + heights.footer;
  const fraction = Math.min(range.max, Math.max(range.min, contentHeight / windowHeight));
  const detent = Math.round(fraction * DETENT_PRECISION) / DETENT_PRECISION;

  useEffect(() => {
    navigation.setOptions({ sheetAllowedDetents: [detent, FULL_SCREEN_DETENT] });
  }, [navigation, detent]);

  return {
    onHeaderLayout: (event: LayoutChangeEvent) => {
      const header = event.nativeEvent.layout.height;
      setHeights((current) => (current.header === header ? current : { ...current, header }));
    },
    onListContentSizeChange: (_width: number, list: number) => {
      setHeights((current) => (current.list === list ? current : { ...current, list }));
    },
    onFooterLayout: (event: LayoutChangeEvent) => {
      const footer = event.nativeEvent.layout.height;
      setHeights((current) => (current.footer === footer ? current : { ...current, footer }));
    },
  };
}
