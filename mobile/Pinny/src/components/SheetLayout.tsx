import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

interface SheetLayoutProps {
  title: string;
  children: ReactNode;
}

// Conteúdo de uma folha nativa do iOS (rota com presentation "formSheet", ver app/_layout.tsx).
// A altura da folha acompanha este conteúdo; o arraste para fechar e o puxador são do sistema.
export function SheetLayout({ title, children }: SheetLayoutProps) {
  return (
    <View className="gap-[18px] px-6 pb-3 pt-7">
      <Text accessibilityRole="header" className="text-title text-text-primary">
        {title}
      </Text>
      {children}
    </View>
  );
}
