import { CalendarDays, Search, SlidersHorizontal } from 'lucide-react-native';
import { View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { Chip } from '@/components/Chip';
import { SkeletonBar, SkeletonGroup } from '@/components/Skeleton';
import { ptBR } from '@/i18n/pt-BR';
import { colors, duration } from '@/theme';

const SEARCH_ICON_SIZE = 21;

interface BoardToolbarProps {
  // Enquanto o quadro carrega, os filtros viram 2 pílulas do skeleton (mesma altura dos chips).
  isLoading: boolean;
}

// Filtros e busca do quadro (Figma "Ferramentas do quadro"). Por enquanto só visual: os filtros
// e a busca ganham ação numa etapa futura.
export function BoardToolbar({ isLoading }: BoardToolbarProps) {
  return (
    <View className="flex-row items-center gap-2 px-6 pb-[18px]">
      {isLoading ? (
        <Animated.View exiting={FadeOut.duration(duration.normal)}>
          <SkeletonGroup className="flex-row gap-2">
            <SkeletonBar className="h-[26px] w-[120px] rounded-[12px]" />
            <SkeletonBar className="h-[26px] w-[84px] rounded-[12px]" />
          </SkeletonGroup>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeIn.duration(duration.normal)} className="flex-row gap-2">
          <Chip label={ptBR.board.filterAll} tone="lavender" icon={SlidersHorizontal} />
          <Chip label={ptBR.board.filterByDeadline} tone="babyBlue" icon={CalendarDays} />
        </Animated.View>
      )}
      <View className="flex-1 items-end" importantForAccessibility="no-hide-descendants">
        <Search size={SEARCH_ICON_SIZE} color={colors.textSecondary} />
      </View>
    </View>
  );
}
