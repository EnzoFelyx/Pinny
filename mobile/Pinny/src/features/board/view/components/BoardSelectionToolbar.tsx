import { Archive, FolderInput, Trash2 } from 'lucide-react-native';

import { GlassToolbar } from '@/components/GlassToolbar';
import { ptBR } from '@/i18n/pt-BR';

import type { CardBatchActions } from '../../viewmodel/useCardBatchActions';

const text = ptBR.board.selection;

interface BoardSelectionToolbarProps {
  batch: CardBatchActions;
}

// Barra de baixo do modo "Selecionar", como no Mail: Mover à esquerda, Arquivar no meio e Apagar
// (vermelho) à direita, em círculos de vidro, apagados até marcar um cartão.
export function BoardSelectionToolbar({ batch }: BoardSelectionToolbarProps) {
  return (
    <GlassToolbar
      actions={[
        {
          key: 'move',
          icon: FolderInput,
          tone: 'accent',
          accessibilityLabel: text.moveA11y,
          onPress: batch.openMove,
          disabled: !batch.canAct,
        },
        {
          key: 'archive',
          icon: Archive,
          tone: 'info',
          accessibilityLabel: text.archiveA11y,
          onPress: batch.archive,
          disabled: !batch.canAct,
        },
        {
          key: 'delete',
          icon: Trash2,
          tone: 'destructive',
          accessibilityLabel: text.deleteA11y,
          onPress: batch.requestDelete,
          disabled: !batch.canAct,
        },
      ]}
    />
  );
}
