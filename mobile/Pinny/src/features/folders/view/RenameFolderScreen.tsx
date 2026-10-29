import { ptBR } from '@/i18n/pt-BR';

import { useRenameFolderViewModel } from '../viewmodel/useRenameFolderViewModel';
import { FolderNameSheet } from './components/FolderNameSheet';

interface RenameFolderScreenProps {
  folderId: string;
}

export function RenameFolderScreen({ folderId }: RenameFolderScreenProps) {
  const vm = useRenameFolderViewModel(folderId);

  return (
    <FolderNameSheet
      title={ptBR.folders.renameFolderTitle}
      submitLabel={ptBR.common.save}
      name={vm.name}
      canSubmit={vm.canSave}
      errorText={vm.errorText}
      onChangeName={vm.changeName}
      onSubmit={vm.save}
    />
  );
}
