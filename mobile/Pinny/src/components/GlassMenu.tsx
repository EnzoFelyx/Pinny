import { Host, Image, Menu } from '@expo/ui/swift-ui';
import {
  accessibilityLabel as accessibilityLabelModifier,
  backgroundOverlay,
  clipShape,
  contentShape,
  frame,
  glassEffect,
  padding,
  shapes,
} from '@expo/ui/swift-ui/modifiers';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import { colors } from '@/theme';

// Mesmo tamanho do GlassIconButton (voltar), que costuma ficar ao lado. O círculo é menor que a
// área de toque mínima do iOS (44pt): a área tocável vai além dele, e a margem negativa do Host
// mantém o layout com o tamanho do círculo.
const BUTTON_SIZE = 40;
const ICON_SIZE = 18;
const MIN_TOUCH_SIZE = 44;
const TOUCH_SLOP = (MIN_TOUCH_SIZE - BUTTON_SIZE) / 2;

// Vidro no iOS 26+; antes dele, a superfície clara (como o GlassIconButton).
const buttonSurface = isLiquidGlassAvailable()
  ? [glassEffect({ glass: { variant: 'regular' }, shape: 'circle' })]
  : [backgroundOverlay({ color: colors.surface }), clipShape('circle')];

interface GlassMenuProps {
  accessibilityLabel: string;
  // Itens do menu (Button, Divider... do @expo/ui/swift-ui).
  children: ReactNode;
}

// Botão "…" redondo de vidro que abre o menu suspenso nativo do iOS (SwiftUI Menu). Base dos
// menus do topo das telas (quadro, pasta).
export function GlassMenu({ accessibilityLabel, children }: GlassMenuProps) {
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
              accessibilityLabelModifier(accessibilityLabel),
            ]}
          />
        }
      >
        {children}
      </Menu>
    </Host>
  );
}

// Host do SwiftUI não aceita className (REGRAS.md, regra 5).
const styles = StyleSheet.create({
  host: { width: MIN_TOUCH_SIZE, height: MIN_TOUCH_SIZE, margin: -TOUCH_SLOP },
});
