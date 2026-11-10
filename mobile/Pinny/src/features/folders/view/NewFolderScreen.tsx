import { FolderPlus } from 'lucide-react-native';

import { NameSheet } from '@/components/NameSheet';
import { ptBR } from '@/i18n/pt-BR';

import { useNewFolderViewModel } from '../viewmodel/useNewFolderViewModel';

export function NewFolderScreen() {
  const vm = useNewFolderViewModel();

  return (
    <NameSheet
      label={ptBR.folders.folderNameLabel}
      icon={FolderPlus}
      placeholder={ptBR.folders.folderNamePlaceholder}
      title={ptBR.folders.newFolderTitle}
      submitLabel={ptBR.folders.createFolder}
      hint={ptBR.common.renameLaterHint}
      name={vm.name}
      canSubmit={vm.canCreate}
      errorText={vm.errorText}
      onChangeName={vm.changeName}
      onSubmit={vm.create}
    />
  );
}
