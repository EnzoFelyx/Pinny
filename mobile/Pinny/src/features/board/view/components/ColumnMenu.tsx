import { Button, Divider, Host, Image, Menu } from '@expo/ui/swift-ui';
import { accessibilityLabel, contentShape, frame, shapes } from '@expo/ui/swift-ui/modifiers';
import { StyleSheet } from 'react-native';

import { ptBR } from '@/i18n/pt-BR';
import { colors } from '@/theme';

const text = ptBR.board.columnMenu;
const ICON_SIZE = 18;
// Área de toque mínima do iOS.
const TOUCH_SIZE = 44;

interface ColumnMenuProps {
  columnId: string;
  canMoveBackward: boolean;
  canMoveForward: boolean;
  onAddCard: (columnId: string) => void;
  onMove: (columnId: string, step: -1 | 1) => void;
  onDuplicate: (columnId: string) => void;
  onDelete: (columnId: string) => void;
}

// "…" da coluna com o menu suspenso nativo do iOS (SwiftUI Menu): ícones SF Symbols e "Excluir
// coluna" em vermelho (papel destrutivo do sistema). Mover para trás/frente somem nas pontas.
export function ColumnMenu({
  columnId,
  canMoveBackward,
  canMoveForward,
  onAddCard,
  onMove,
  onDuplicate,
  onDelete,
}: ColumnMenuProps) {
  return (
    <Host style={styles.host}>
      <Menu
        label={
          <Image
            systemName="ellipsis"
            size={ICON_SIZE}
            color={colors.textSecondary}
            modifiers={[
              frame({ width: TOUCH_SIZE, height: TOUCH_SIZE }),
              contentShape(shapes.rectangle()),
              accessibilityLabel(ptBR.board.columnOptions),
            ]}
          />
        }
      >
        <Button label={text.addCard} systemImage="plus" onPress={() => onAddCard(columnId)} />
        {canMoveBackward ? (
          <Button
            label={text.moveBackward}
            systemImage="arrow.left"
            onPress={() => onMove(columnId, -1)}
          />
        ) : null}
        {canMoveForward ? (
          <Button
            label={text.moveForward}
            systemImage="arrow.right"
            onPress={() => onMove(columnId, 1)}
          />
        ) : null}
        <Button
          label={text.duplicate}
          systemImage="plus.square.on.square"
          onPress={() => onDuplicate(columnId)}
        />
        {/* Ação destrutiva separada das outras, como no iOS. */}
        <Divider />
        <Button
          label={text.delete}
          systemImage="trash"
          role="destructive"
          onPress={() => onDelete(columnId)}
        />
      </Menu>
    </Host>
  );
}

// Host do SwiftUI não aceita className (REGRAS.md, regra 5).
const styles = StyleSheet.create({
  host: { width: TOUCH_SIZE, height: TOUCH_SIZE },
});
