import { ptBR } from '@/i18n/pt-BR';

import { useNewFolderViewModel } from '../viewmodel/useNewFolderViewModel';
import { FolderNameSheet } from './components/FolderNameSheet';

export function NewFolderScreen() {
  const vm = useNewFolderViewModel();

  return (
    <FolderNameSheet
      title={ptBR.folders.newFolderTitle}
      submitLabel={ptBR.folders.createFolder}
      name={vm.name}
      canSubmit={vm.canCreate}
      errorText={vm.errorText}
      onChangeName={vm.changeName}
      onSubmit={vm.create}
    />
  );
}
