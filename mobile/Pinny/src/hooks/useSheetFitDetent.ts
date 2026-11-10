import { useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { useWindowDimensions } from 'react-native';

// Como a folha se ajusta ao conteúdo: a primeira parada é a altura do conteúdo, limitada entre
// min e max (frações da tela); expandable acrescenta a parada de tela toda, para puxar.
export interface SheetDetentPolicy {
  min: number;
  max: number;
  expandable: boolean;
}

const FULL_SCREEN_DETENT = 1;
// Arredonda a fração (milésimos) para não trocar as paradas a cada pixel medido.
const DETENT_PRECISION = 1000;

// Folha nativa (formSheet) do tamanho do conteúdo medido. Sem a parada de tela toda, a folha
// não expande e, com o teclado, só sobe junto com ele. contentHeight null = ainda não mediu.
export function useSheetFitDetent(contentHeight: number | null, policy: SheetDetentPolicy) {
  const navigation = useNavigation();
  const { height: windowHeight } = useWindowDimensions();
  const { min, max, expandable } = policy;

  const fraction =
    contentHeight === null ? null : Math.min(max, Math.max(min, contentHeight / windowHeight));
  const detent =
    fraction === null ? null : Math.round(fraction * DETENT_PRECISION) / DETENT_PRECISION;

  useEffect(() => {
    if (detent === null) return;
    navigation.setOptions({
      sheetAllowedDetents: expandable ? [detent, FULL_SCREEN_DETENT] : [detent],
    });
  }, [navigation, detent, expandable]);
}
