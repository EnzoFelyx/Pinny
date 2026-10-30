import { ChevronLeft, Ellipsis } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { GlassIconButton } from '@/components/GlassIconButton';
import { ptBR } from '@/i18n/pt-BR';

interface BoardHeaderProps {
  title: string;
  subtitle: string;
  errorText: string | null;
  onBack: () => void;
  onOpenMenu: () => void;
}

// Topo do quadro (Figma "Cabeçalho"): voltar, título e menu na mesma linha. Substitui a barra
// nativa; o gesto de voltar pela borda da tela continua sendo do sistema.
export function BoardHeader({ title, subtitle, errorText, onBack, onOpenMenu }: BoardHeaderProps) {
  return (
    <View className="gap-1 px-6 pb-5 pt-2">
      <View className="flex-row items-center gap-3">
        <GlassIconButton
          icon={ChevronLeft}
          accessibilityLabel={ptBR.common.back}
          onPress={onBack}
        />
        <View className="flex-1 gap-[3px]">
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
        </View>
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
