import { View } from 'react-native';

import type { LabelColor } from '@/features/card/model/card.types';

import type { FolderIcon } from '../../model/folder.schema';
import { folderBackgroundClass, folderIcons, folderInkColors } from '../folderAppearance';

const ICON_SIZE = 22;

interface FolderBadgeProps {
  icon: FolderIcon;
  color: LabelColor;
}

// Ícone da pasta no fundo pastel da cor dela, do tamanho dos botões do topo. Decorativo: o nome
// da pasta, ao lado, já identifica a tela. Na etapa 8, ícone e cor ficam editáveis.
export function FolderBadge({ icon, color }: FolderBadgeProps) {
  const Icon = folderIcons[icon];
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={`h-10 w-10 items-center justify-center rounded-[12px] ${folderBackgroundClass[color]}`}
    >
      <Icon size={ICON_SIZE} color={folderInkColors[color]} />
    </View>
  );
}
