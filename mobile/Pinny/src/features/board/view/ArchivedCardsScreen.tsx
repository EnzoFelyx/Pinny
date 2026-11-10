import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { Column } from '@/components/Column';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors } from '@/theme';

import { useArchivedCardsViewModel } from '../viewmodel/useArchivedCardsViewModel';
import { boardRenameLabels } from './components/BoardMenu';

interface ArchivedCardsScreenProps {
  boardId: string;
}

function noMenu() {
  return null;
}

// Tela "Arquivados" do quadro (provisória, até o desenho no Figma): os cartões arquivados numa
// coluna só de leitura, do mais recente para o mais antigo.
export function ArchivedCardsScreen({ boardId }: ArchivedCardsScreenProps) {
  const vm = useArchivedCardsViewModel(boardId);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <ScreenHeader
        title={vm.title}
        subtitle={vm.subtitle}
        isLoading={vm.isLoading}
        errorText={vm.errorText}
        onBack={vm.goBack}
        renameLabels={boardRenameLabels}
        renderMenu={noMenu}
      />
      {vm.isLoading ? null : (
        <ScrollView contentContainerClassName="px-6 pb-6">
          <Column
            title={vm.columnTitle}
            cardCount={vm.cards.length}
            isReadOnly
            emptyMessage={vm.emptyMessage}
          >
            {vm.cards.map((card) => (
              <Card
                key={card.id}
                title={card.title}
                accessibilityLabel={card.accessibilityLabel}
                labels={card.labels}
                priority={card.priority}
                deadline={card.deadline}
                checklistText={card.checklistText}
              />
            ))}
          </Column>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// SafeAreaView não aceita className (REGRAS.md, regra 5).
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
});
