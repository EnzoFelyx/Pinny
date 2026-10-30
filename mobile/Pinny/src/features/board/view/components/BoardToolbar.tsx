import { CalendarDays, Search, SlidersHorizontal } from 'lucide-react-native';
import { View } from 'react-native';

import { Chip } from '@/components/Chip';
import { ptBR } from '@/i18n/pt-BR';
import { colors } from '@/theme';

const SEARCH_ICON_SIZE = 21;

// Filtros e busca do quadro (Figma "Ferramentas do quadro"). Por enquanto só visual: os filtros
// e a busca ganham ação numa etapa futura.
export function BoardToolbar() {
  return (
    <View className="flex-row items-center gap-2 px-6 pb-[18px]">
      <Chip label={ptBR.board.filterAll} tone="lavender" icon={SlidersHorizontal} />
      <Chip label={ptBR.board.filterByDeadline} tone="babyBlue" icon={CalendarDays} />
      <View className="flex-1 items-end" importantForAccessibility="no-hide-descendants">
        <Search size={SEARCH_ICON_SIZE} color={colors.textSecondary} />
      </View>
    </View>
  );
}
