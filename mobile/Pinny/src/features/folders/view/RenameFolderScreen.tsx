import { FolderPlus } from 'lucide-react-native';

import { NameSheet } from '@/components/NameSheet';
import { ptBR } from '@/i18n/pt-BR';

import { useRenameFolderViewModel } from '../viewmodel/useRenameFolderViewModel';

interface RenameFolderScreenProps {
  folderId: string;
}

export function RenameFolderScreen({ folderId }: RenameFolderScreenProps) {
  const vm = useRenameFolderViewModel(folderId);

  return (
    <NameSheet
      label={ptBR.folders.folderNameLabel}
      icon={FolderPlus}
      placeholder={ptBR.folders.folderNamePlaceholder}
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
