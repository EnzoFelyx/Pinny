import { SlidersHorizontal } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { SkeletonBar, SkeletonGroup } from '@/components/Skeleton';
import { ptBR } from '@/i18n/pt-BR';
import { colors, duration } from '@/theme';

import type { BoardFilterViewModel } from '../../viewmodel/useBoardFilter';
import { FilterChip } from './FilterChip';

const text = ptBR.board.filter;
const FILTERS_ICON_SIZE = 14;
// Ação de texto com 32pt de altura: o hitSlop completa os 44pt de área de toque.
const ACTION_HIT_SLOP = 6;

interface BoardToolbarProps {
  // Enquanto o quadro carrega, os filtros viram 2 pílulas do skeleton (mesma altura dos chips).
  isLoading: boolean;
  filter: BoardFilterViewModel;
}

// Linha de filtros do quadro (Figma "Quick filters"). Sem filtro: atalhos de um toque e
// "Filtros", que abre o modal. Com filtro: um chip removível por filtro ligado e "Limpar", para
// ficar sempre claro que há cartões escondidos.
export function BoardToolbar({ isLoading, filter }: BoardToolbarProps) {
  if (isLoading) {
    return (
      <Animated.View exiting={FadeOut.duration(duration.normal)} className="px-6 pb-[18px]">
        <SkeletonGroup className="flex-row gap-2">
          <SkeletonBar className="h-8 w-[64px] rounded-[12px]" />
          <SkeletonBar className="h-8 w-[96px] rounded-[12px]" />
          <SkeletonBar className="h-8 w-[56px] rounded-[12px]" />
        </SkeletonGroup>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(duration.normal)} className="flex-row pb-[18px]">
      <ScrollView
        horizontal
        className="flex-1"
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="items-center gap-2 pl-6 pr-2"
      >
        {filter.hasActiveFilter
          ? filter.activeChips.map((chip) => (
              <FilterChip
                key={chip.key}
                label={chip.label}
                accessibilityLabel={chip.removeAccessibilityLabel}
                onPress={chip.remove}
                isActive
              />
            ))
          : filter.quickFilters.map((quick) => (
              <FilterChip
                key={quick.id}
                label={quick.label}
                accessibilityLabel={quick.accessibilityLabel}
                onPress={quick.toggle}
              />
            ))}
      </ScrollView>
      <View className="justify-center pl-2 pr-6">
        {filter.hasActiveFilter ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={text.clearAllA11y}
            hitSlop={ACTION_HIT_SLOP}
            onPress={filter.clearApplied}
            className="h-8 justify-center active:opacity-60"
          >
            <Text className="text-label text-on-secondary">{text.clear}</Text>
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={text.openFiltersA11y}
            hitSlop={ACTION_HIT_SLOP}
            onPress={filter.open}
            className="h-8 flex-row items-center gap-1 active:opacity-60"
          >
            <SlidersHorizontal size={FILTERS_ICON_SIZE} color={colors.onSecondary} />
            <Text className="text-label text-on-secondary">{text.openFilters}</Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}
