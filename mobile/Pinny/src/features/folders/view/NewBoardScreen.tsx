import { SquareKanban } from 'lucide-react-native';

import { NameSheet } from '@/components/NameSheet';
import { ptBR } from '@/i18n/pt-BR';

import { useNewBoardViewModel } from '../viewmodel/useNewBoardViewModel';

const text = ptBR.folders.newBoard;

interface NewBoardScreenProps {
  folderId: string;
  initialTitle?: string;
}

// Mesma folha da "Nova pasta" e da "Nova coluna" (NameSheet), com título, ícone e o aviso da
// pasta próprios, para não confundir as três.
export function NewBoardScreen({ folderId, initialTitle }: NewBoardScreenProps) {
  const vm = useNewBoardViewModel(folderId, initialTitle);

  return (
    <NameSheet
      title={text.title}
      description={vm.folderNotice}
      label={text.label}
      icon={SquareKanban}
      placeholder={text.placeholder}
      submitLabel={text.submit}
      hint={ptBR.common.renameLaterHint}
      name={vm.name}
      canSubmit={vm.canCreate}
      errorText={vm.errorText}
      onChangeName={vm.changeName}
      onSubmit={vm.create}
    />
  );
}
