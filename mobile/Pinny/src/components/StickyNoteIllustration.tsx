import { View } from 'react-native';

// Ilustração decorativa do Figma (folha + post-it), escondida do leitor de tela.
export function StickyNoteIllustration() {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="h-[72px] w-[80px]"
    >
      <View className="absolute left-2 top-1 h-16 w-16 -rotate-[8deg] rounded-[12px] bg-lavender" />
      <View className="absolute left-[3px] top-[15px] h-[52px] w-[53px] rotate-[8deg] rounded-[10px] bg-butter" />
      <View className="absolute left-[22px] top-[28px] gap-1.5">
        <View className="h-[3px] w-[25px] rounded-[2px] bg-illustration-line" />
        <View className="h-[3px] w-[17px] rounded-[2px] bg-illustration-line" />
      </View>
    </View>
  );
}
