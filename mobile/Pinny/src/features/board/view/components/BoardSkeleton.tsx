import { type StyleProp, View, type ViewStyle } from 'react-native';

import { SkeletonBar, SkeletonGroup } from '@/components/Skeleton';
import { ptBR } from '@/i18n/pt-BR';

// Modelo do quadro carregando: 2 colunas, com 4 e 3 cartões (pedido do autor), nas medidas reais.
const CARDS_PER_COLUMN = [4, 3] as const;

interface BoardSkeletonProps {
  // Largura de uma coluna (vem da tela, em tempo de execução).
  columnStyle: StyleProp<ViewStyle>;
}

function CardSkeleton() {
  return (
    <View className="gap-2 rounded-[18px] bg-surface p-3 shadow-card">
      <SkeletonBar className="h-[22px] w-16 rounded-[12px]" />
      <SkeletonBar className="h-[15px] w-4/5 rounded-[6px]" />
      <SkeletonBar className="h-[22px] w-1/3 rounded-[12px]" />
    </View>
  );
}

// Fica no lugar das colunas enquanto o quadro carrega (dentro da mesma rolagem horizontal).
export function BoardSkeleton({ columnStyle }: BoardSkeletonProps) {
  return (
    <SkeletonGroup accessibilityLabel={ptBR.board.loading} className="flex-row gap-3">
      {CARDS_PER_COLUMN.map((cardCount, columnIndex) => (
        <View
          key={columnIndex}
          style={columnStyle}
          className="self-start rounded-[24px] bg-column-background px-4 pb-4"
        >
          <View className="flex-row items-center justify-between pb-3 pt-4">
            <SkeletonBar className="h-[18px] w-1/2 rounded-[6px]" />
            <SkeletonBar className="h-[25px] w-[25px] rounded-[9px]" />
          </View>
          <View className="gap-2.5">
            {Array.from({ length: cardCount }, (_, cardIndex) => (
              <CardSkeleton key={cardIndex} />
            ))}
          </View>
        </View>
      ))}
    </SkeletonGroup>
  );
}
