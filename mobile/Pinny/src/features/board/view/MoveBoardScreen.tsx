import { FolderInput } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { SheetLayout } from '@/components/SheetLayout';
import { ptBR } from '@/i18n/pt-BR';

import { useMoveBoardViewModel } from '../viewmodel/useMoveBoardViewModel';
import { OptionRow } from '@/components/OptionRow';

const text = ptBR.board.moveBoardSheet;

interface MoveBoardScreenProps {
  boardId: string;
}

// Folha nativa "Mover "Quadro" para a pasta:": a lista de pastas (a atual marcada) e "Mover".
export function MoveBoardScreen({ boardId }: MoveBoardScreenProps) {
  const vm = useMoveBoardViewModel(boardId);

  return (
    <SheetLayout
      title={vm.title}
      icon={FolderInput}
      footer={
        <>
          {vm.noticeText ? (
            <Text accessibilityLiveRegion="polite" className="text-body text-text-secondary">
              {vm.noticeText}
            </Text>
          ) : null}
          {vm.errorText ? (
            <Text accessibilityLiveRegion="polite" className="text-body text-alert">
              {vm.errorText}
            </Text>
          ) : null}
          <Button label={text.submit} disabled={!vm.canMove} onPress={vm.move} />
        </>
      }
    >
      <View accessibilityRole="radiogroup" accessibilityLabel={text.folderLabel} className="gap-1">
        <Text className="pb-1 text-label text-text-secondary">{text.folderLabel}</Text>
        {vm.folderOptions.map((option) => (
          <OptionRow
            key={option.value}
            label={option.label}
            isSelected={option.isSelected}
            onPress={() => vm.selectFolder(option.value)}
            size="large"
          />
        ))}
      </View>
    </SheetLayout>
  );
}
