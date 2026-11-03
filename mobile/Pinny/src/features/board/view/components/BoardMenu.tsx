import { Button, Divider, Host, Image, Menu } from '@expo/ui/swift-ui';
import {
  accessibilityLabel,
  backgroundOverlay,
  clipShape,
  contentShape,
  frame,
  glassEffect,
  padding,
  shapes,
} from '@expo/ui/swift-ui/modifiers';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { StyleSheet } from 'react-native';

import { ptBR } from '@/i18n/pt-BR';
import { colors } from '@/theme';

const text = ptBR.board.boardMenu;
// Mesmo tamanho do GlassIconButton (voltar), ao lado. O círculo é menor que a área de toque
// mínima do iOS (44pt): a área tocável vai além dele, e a margem negativa do Host mantém o layout
// com o tamanho do círculo.
const BUTTON_SIZE = 40;
const ICON_SIZE = 18;
const MIN_TOUCH_SIZE = 44;
const TOUCH_SLOP = (MIN_TOUCH_SIZE - BUTTON_SIZE) / 2;

function noop() {}

// Vidro no iOS 26+; antes dele, a superfície clara (como o GlassIconButton).
const buttonSurface = isLiquidGlassAvailable()
  ? [glassEffect({ glass: { variant: 'regular' }, shape: 'circle' })]
  : [backgroundOverlay({ color: colors.surface }), clipShape('circle')];

// "…" do topo do quadro com o menu suspenso nativo do iOS (SwiftUI Menu), em três grupos: o
// conteúdo do quadro, o quadro em si e a exclusão (vermelha, papel destrutivo do sistema).
// Por enquanto só "Renomear quadro" funciona; as outras opções ainda não fazem nada. Os filtros
// ficam na linha abaixo do título ("Filtros"), não no menu.
interface BoardMenuProps {
  // "Renomear quadro": edita o título ali mesmo (o mesmo de tocar no nome).
  onRename: () => void;
}

export function BoardMenu({ onRename }: BoardMenuProps) {
  return (
    <Host style={styles.host}>
      <Menu
        label={
          <Image
            systemName="ellipsis"
            size={ICON_SIZE}
            color={colors.textPrimary}
            modifiers={[
              frame({ width: BUTTON_SIZE, height: BUTTON_SIZE }),
              ...buttonSurface,
              padding({ all: TOUCH_SLOP }),
              contentShape(shapes.rectangle()),
              accessibilityLabel(ptBR.board.boardOptions),
            ]}
          />
        }
      >
        <Button label={text.search} systemImage="magnifyingglass" onPress={noop} />
        <Button label={text.selectCards} systemImage="checkmark.circle" onPress={noop} />
        <Button label={text.newColumn} systemImage="plus" onPress={noop} />
        <Button label={text.reorderColumns} systemImage="arrow.up.arrow.down" onPress={noop} />
        <Divider />
        <Button label={text.rename} systemImage="pencil" onPress={onRename} />
        <Button label={text.duplicate} systemImage="plus.square.on.square" onPress={noop} />
        <Button label={text.moveToFolder} systemImage="folder" onPress={noop} />
        <Divider />
        <Button label={text.delete} systemImage="trash" role="destructive" onPress={noop} />
      </Menu>
    </Host>
  );
}

// Host do SwiftUI não aceita className (REGRAS.md, regra 5).
const styles = StyleSheet.create({
  host: { width: MIN_TOUCH_SIZE, height: MIN_TOUCH_SIZE, margin: -TOUCH_SLOP },
});
