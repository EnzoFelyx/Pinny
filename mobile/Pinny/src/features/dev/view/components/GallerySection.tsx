import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

interface GallerySectionProps {
  title: string;
  children: ReactNode;
}

export function GallerySection({ title, children }: GallerySectionProps) {
  return (
    <View className="gap-3">
      <Text accessibilityRole="header" className="text-label text-text-secondary">
        {title}
      </Text>
      {children}
    </View>
  );
}
