import { View } from 'react-native';

import { SkeletonBar, SkeletonGroup } from '@/components/Skeleton';
import { ptBR } from '@/i18n/pt-BR';

// Linhas de 2 blocos de quadro, nas medidas reais (58 de altura).
const ROWS = 3;

// Skeleton da tela da pasta enquanto os quadros carregam: a busca e a grade de quadros.
export function FolderSkeleton() {
  return (
    <SkeletonGroup accessibilityLabel={ptBR.folders.folderScreen.loading} className="gap-2.5">
      <SkeletonBar className="mb-2 h-[52px] w-full rounded-[18px]" />
      {Array.from({ length: ROWS }, (_, row) => (
        <View key={row} className="flex-row gap-2.5">
          <SkeletonBar className="h-[58px] flex-1 rounded-[12px]" />
          <SkeletonBar className="h-[58px] flex-1 rounded-[12px]" />
        </View>
      ))}
    </SkeletonGroup>
  );
}
