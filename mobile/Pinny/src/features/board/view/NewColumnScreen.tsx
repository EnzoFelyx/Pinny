import { Columns3 } from 'lucide-react-native';

import { NameSheet } from '@/components/NameSheet';
import { ptBR } from '@/i18n/pt-BR';

import { useNewColumnViewModel } from '../viewmodel/useNewColumnViewModel';

const text = ptBR.board.newColumn;

interface NewColumnScreenProps {
  boardId: string;
  cardIds?: readonly string[];
}

export function NewColumnScreen({ boardId, cardIds }: NewColumnScreenProps) {
  const vm = useNewColumnViewModel(boardId, cardIds);

  return (
    <NameSheet
      title={text.title}
      description={vm.cardNotice ?? undefined}
      label={text.label}
      icon={Columns3}
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
