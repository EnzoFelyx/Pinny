import { Text } from 'react-native';

import { ScreenPlaceholder } from '@/components/ScreenPlaceholder';

import { useBoardViewModel } from '../viewmodel/useBoardViewModel';

interface BoardScreenProps {
  boardId: string;
}

export function BoardScreen({ boardId }: BoardScreenProps) {
  const vm = useBoardViewModel(boardId);

  return (
    <ScreenPlaceholder title={vm.title}>
      {vm.errorText ? <Text className="text-body text-alert">{vm.errorText}</Text> : null}
    </ScreenPlaceholder>
  );
}
