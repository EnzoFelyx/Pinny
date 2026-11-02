import { ChevronLeft, Ellipsis } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { GlassIconButton } from '@/components/GlassIconButton';
import { SkeletonBar, SkeletonGroup } from '@/components/Skeleton';
import { ptBR } from '@/i18n/pt-BR';
import { duration } from '@/theme';

interface BoardHeaderProps {
  title: string;
  subtitle: string;
  // Enquanto o quadro carrega, título e subtítulo viram barras do skeleton.
  isLoading: boolean;
  errorText: string | null;
  onBack: () => void;
  onOpenMenu: () => void;
}

// Topo do quadro (Figma "Cabeçalho"): voltar, título e menu na mesma linha. Substitui a barra
// nativa; o gesto de voltar pela borda da tela continua sendo do sistema.
export function BoardHeader({
  title,
  subtitle,
  isLoading,
  errorText,
  onBack,
  onOpenMenu,
}: BoardHeaderProps) {
  return (
    <View className="gap-1 px-6 pb-5 pt-2">
      <View className="flex-row items-center gap-3">
        <GlassIconButton
          icon={ChevronLeft}
          accessibilityLabel={ptBR.common.back}
          onPress={onBack}
        />
        {isLoading ? (
          // Mesmas alturas das linhas do título e do subtítulo: nada pula quando eles chegam.
          <Animated.View exiting={FadeOut.duration(duration.normal)} style={styles.fill}>
            <SkeletonGroup className="gap-[3px]">
              <View className="h-[30px] justify-center">
                <SkeletonBar className="h-[20px] w-3/5 rounded-[6px]" />
              </View>
              <View className="h-[19px] justify-center">
                <SkeletonBar className="h-[13px] w-2/5 rounded-[6px]" />
              </View>
            </SkeletonGroup>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.duration(duration.normal)} className="flex-1 gap-[3px]">
            <Text
              accessibilityRole="header"
              numberOfLines={1}
              className="text-title text-text-primary"
            >
              {title}
            </Text>
            <Text numberOfLines={1} className="text-body text-text-secondary">
              {subtitle}
            </Text>
          </Animated.View>
        )}
        <GlassIconButton
          icon={Ellipsis}
          accessibilityLabel={ptBR.board.boardOptions}
          onPress={onOpenMenu}
        />
      </View>
      {errorText ? (
        <Text accessibilityLiveRegion="polite" className="text-body text-alert">
          {errorText}
        </Text>
      ) : null}
    </View>
  );
}

// Os fades do Reanimated pedem Animated.View com style (REGRAS.md, regra 5).
const styles = StyleSheet.create({
  fill: { flex: 1 },
});
