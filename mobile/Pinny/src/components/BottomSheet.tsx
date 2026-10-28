import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { type ReactNode, useCallback, useEffect, useRef } from 'react';
import { StyleSheet, Text } from 'react-native';

import { colors } from '@/theme';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const HANDLE_WIDTH = 36;
const HANDLE_HEIGHT = 4;

// Painel inferior com altura pelo conteúdo. Fecha arrastando para baixo ou tocando fora.
export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  const sheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (isOpen) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [isOpen]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={1}
        pressBehavior="close"
        style={[props.style, styles.backdrop]}
      />
    ),
    [],
  );

  // O @gorhom/bottom-sheet não aceita className: estilos via StyleSheet (REGRAS.md, regra 5).
  return (
    <BottomSheetModal
      ref={sheetRef}
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handle}
      accessibilityLabel={title}
    >
      <BottomSheetView style={styles.content}>
        <Text accessibilityRole="header" className="text-title text-text-primary">
          {title}
        </Text>
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: colors.overlay,
  },
  background: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handle: {
    width: HANDLE_WIDTH,
    height: HANDLE_HEIGHT,
    backgroundColor: colors.border,
  },
  content: {
    gap: 18,
    paddingHorizontal: 24,
    paddingTop: 6,
    paddingBottom: 36,
  },
});
