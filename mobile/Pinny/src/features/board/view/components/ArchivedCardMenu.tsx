import { Button, ContextMenu, Host, RNHostView } from '@expo/ui/swift-ui';
import type { AccessibilityActionEvent } from 'react-native';

import { Card } from '@/components/Card';
import { ptBR } from '@/i18n/pt-BR';

import type { ArchivedCardItem } from '../../viewmodel/archivedItems';

const text = ptBR.board.archived;
const UNARCHIVE_ACTION = 'unarchive';
const accessibilityActions = [{ name: UNARCHIVE_ACTION, label: text.unarchive }] as const;

interface ArchivedCardMenuProps {
  card: ArchivedCardItem;
  onUnarchive: (cardId: string) => void;
}

// Tela "Arquivados": segurar o cartão abre o menu de contexto nativo do iOS (Liquid Glass) com
// "Desarquivar". O VoiceOver tem a mesma ação no cartão (regra 15).
export function ArchivedCardMenu({ card, onUnarchive }: ArchivedCardMenuProps) {
  const unarchive = () => onUnarchive(card.id);
  const handleAccessibilityAction = (event: AccessibilityActionEvent) => {
    if (event.nativeEvent.actionName === UNARCHIVE_ACTION) unarchive();
  };

  return (
    // Largura da coluna e altura do cartão (cada cartão tem a sua).
    <Host matchContents={{ vertical: true }}>
      <ContextMenu>
        <ContextMenu.Items>
          <Button label={text.unarchive} systemImage="tray.and.arrow.up" onPress={unarchive} />
        </ContextMenu.Items>
        <ContextMenu.Trigger>
          <RNHostView matchContents={{ vertical: true }}>
            <Card
              title={card.title}
              titleParts={card.titleParts}
              accessibilityLabel={card.accessibilityLabel}
              labels={card.labels}
              priority={card.priority}
              deadline={card.deadline}
              checklistText={card.checklistText}
              thumbnail={card.thumbnail}
              footnote={card.archivedText}
              accessibilityActions={accessibilityActions}
              onAccessibilityAction={handleAccessibilityAction}
            />
          </RNHostView>
        </ContextMenu.Trigger>
      </ContextMenu>
    </Host>
  );
}
