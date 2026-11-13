import { useDestructiveConfirm } from '@/hooks/useDestructiveConfirm';

import type { BoardViewModel } from '../../viewmodel/useBoardViewModel';

// Alertas nativos de confirmação do quadro: apagar a coluna, os cartões selecionados e o quadro.
// Os textos vêm prontos do ViewModel.
export function useBoardConfirms(vm: BoardViewModel) {
  useDestructiveConfirm(vm.columnDeleteRequest, {
    onConfirm: vm.confirmDeleteColumn,
    onCancel: vm.closeDeleteColumn,
  });
  useDestructiveConfirm(vm.batch.deleteRequest, {
    onConfirm: vm.batch.confirmDelete,
    onCancel: vm.batch.cancelDelete,
  });
  useDestructiveConfirm(vm.deleteBoardRequest, {
    onConfirm: vm.confirmDeleteBoard,
    onCancel: vm.cancelDeleteBoard,
  });
}
