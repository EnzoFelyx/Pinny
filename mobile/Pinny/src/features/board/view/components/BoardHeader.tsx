import { ChevronLeft } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { GlassIconButton } from '@/components/GlassIconButton';
import { SkeletonBar, SkeletonGroup } from '@/components/Skeleton';
import { useInlineRename } from '@/hooks/useInlineRename';
import { ptBR } from '@/i18n/pt-BR';
import { duration } from '@/theme';

import { BoardMenu } from './BoardMenu';
import { BoardTitle } from './BoardTitle';

interface BoardHeaderProps {
  title: string;
  subtitle: string;
  // Enquanto o quadro carrega, título e subtítulo viram barras do skeleton.
  isLoading: boolean;
  errorText: string | null;
  onBack: () => void;
  onRename: (title: string) => void;
}

// Topo do quadro (Figma "Cabeçalho"): voltar, título e menu na mesma linha. Substitui a barra
// nativa; o gesto de voltar pela borda da tela continua sendo do sistema.
export function BoardHeader({
  title,
  subtitle,
  isLoading,
  errorText,
  onBack,
  onRename,
}: BoardHeaderProps) {
  // Enquanto carrega, o título ainda não existe: nada para renomear.
  const rename = useInlineRename({ title, onRename: isLoading ? undefined : onRename });

  return (
    <View className="gap-1 px-6 pb-6 pt-4">
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
              <View className="h-[27px] justify-center">
                <SkeletonBar className="h-[18px] w-3/5 rounded-[6px]" />
              </View>
              <View className="h-[19px] justify-center">
                <SkeletonBar className="h-[13px] w-2/5 rounded-[6px]" />
              </View>
            </SkeletonGroup>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.duration(duration.normal)} style={styles.fill}>
            <BoardTitle title={title} subtitle={subtitle} rename={rename} />
          </Animated.View>
        )}
        <BoardMenu onRename={rename.startEditing} />
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
