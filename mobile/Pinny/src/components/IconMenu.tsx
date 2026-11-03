import { Host, Image, Menu } from '@expo/ui/swift-ui';
import {
  accessibilityLabel as accessibilityLabelModifier,
  contentShape,
  frame,
  rotationEffect,
  shapes,
} from '@expo/ui/swift-ui/modifiers';
import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import { colors } from '@/theme';

const ICON_SIZE = 18;
// Área de toque mínima do iOS.
const TOUCH_SIZE = 44;
const VERTICAL_ANGLE = 90;

interface IconMenuProps {
  accessibilityLabel: string;
  // "⋮" em vez de "…" (ex.: card da pasta na Início).
  isVertical?: boolean;
  // Itens do menu (Button, Divider... do @expo/ui/swift-ui).
  children: ReactNode;
}

// "…" simples (sem fundo) que abre o menu suspenso nativo do iOS (SwiftUI Menu), com área de
// toque de 44pt. Base dos menus de itens da tela (coluna, pasta).
export function IconMenu({ accessibilityLabel, isVertical = false, children }: IconMenuProps) {
  return (
    <Host style={styles.host}>
      <Menu
        label={
          <Image
            systemName="ellipsis"
            size={ICON_SIZE}
            color={colors.textSecondary}
            modifiers={[
              ...(isVertical ? [rotationEffect(VERTICAL_ANGLE)] : []),
              frame({ width: TOUCH_SIZE, height: TOUCH_SIZE }),
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
  host: { width: TOUCH_SIZE, height: TOUCH_SIZE },
});
