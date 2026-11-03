import { ChevronLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { GlassIconButton } from '@/components/GlassIconButton';
import { EditableTitle } from '@/components/EditableTitle';
import { SkeletonBar, SkeletonGroup } from '@/components/Skeleton';
import { useInlineRename } from '@/hooks/useInlineRename';
import { ptBR } from '@/i18n/pt-BR';
import { duration } from '@/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle: string;
  // Enquanto a tela carrega, título e subtítulo viram barras do skeleton.
  isLoading: boolean;
  errorText: string | null;
  onBack: () => void;
  // Título editado ali mesmo (quadro). Sem ele, o título é só leitura ou usa onTitlePress.
  onRename?: (title: string) => void;
  // Toque no título faz outra coisa (ex.: a pasta abre a folha "Personalizar").
  onTitlePress?: () => void;
  // Textos do leitor de tela do toque no título (ex.: "Renomear quadro").
  renameLabels: { action: string; hint: string; input: string };
  // Antes do título (ex.: ícone e cor da pasta).
  leading?: ReactNode;
  // O "…" da tela; recebe a função que começa a edição do título (item "Renomear" do menu).
  renderMenu: (startRename: () => void) => ReactNode;
}

// Topo das telas com título editável (quadro, pasta; Figma "Cabeçalho"): voltar, título e menu
// na mesma linha. Substitui a barra nativa; o gesto de voltar pela borda continua do sistema.
export function ScreenHeader({
  title,
  subtitle,
  isLoading,
  errorText,
  onBack,
  onRename,
  onTitlePress,
  renameLabels,
  leading,
  renderMenu,
}: ScreenHeaderProps) {
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
        {leading}
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
            <EditableTitle
              title={title}
              subtitle={subtitle}
              rename={rename}
              renameActionLabel={renameLabels.action}
              renameHint={renameLabels.hint}
              inputLabel={renameLabels.input}
              onPress={onTitlePress}
            />
          </Animated.View>
        )}
        {renderMenu(rename.startEditing)}
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
