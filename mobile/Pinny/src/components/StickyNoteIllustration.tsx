import { View } from 'react-native';

export type IllustrationVariant = 0 | 1 | 2 | 3 | 4;

interface StickyNoteIllustrationProps {
  variant?: IllustrationVariant;
}

interface VariantClasses {
  back: string;
  front: string;
  // Tracinhos de "texto" no post-it da frente (larguras).
  lines: readonly string[];
  // Alfinete no topo do post-it da frente.
  hasPin?: boolean;
}

// Duas notas sobrepostas com cores e inclinações diferentes por variação (Figma: folha + post-it).
// A variação 0 é a original do Figma.
const variants: Record<IllustrationVariant, VariantClasses> = {
  0: {
    back: 'left-2 top-1 -rotate-[8deg] bg-lavender',
    front: 'left-[3px] top-[15px] rotate-[8deg] bg-butter',
    lines: ['w-[25px]', 'w-[17px]'],
  },
  1: {
    back: 'left-[10px] top-0 rotate-[6deg] bg-mint',
    front: 'left-[2px] top-4 -rotate-[6deg] bg-peach',
    lines: ['w-[25px]', 'w-[20px]', 'w-[13px]'],
  },
  2: {
    back: 'left-[6px] top-[2px] -rotate-[12deg] bg-baby-blue',
    front: 'left-[6px] top-[14px] rotate-[4deg] bg-butter',
    lines: ['w-[22px]'],
    hasPin: true,
  },
  3: {
    back: 'left-3 top-[2px] rotate-[10deg] bg-peach',
    front: 'left-0 top-[14px] -rotate-[4deg] bg-lavender',
    lines: ['w-[25px]', 'w-[17px]'],
    hasPin: true,
  },
  4: {
    back: 'left-1 top-1 -rotate-[5deg] bg-butter',
    front: 'left-[8px] top-4 rotate-[10deg] bg-mint',
    lines: ['w-[18px]', 'w-[25px]', 'w-[12px]'],
  },
};

// Ilustração decorativa dos estados vazios, escondida do leitor de tela. Todas as variações têm
// o mesmo tamanho (80×72), para a coluna vazia não mudar de altura entre elas.
export function StickyNoteIllustration({ variant = 0 }: StickyNoteIllustrationProps) {
  const { back, front, lines, hasPin } = variants[variant];
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="h-[72px] w-[80px]"
    >
      <View className={`absolute h-16 w-16 rounded-[12px] ${back}`} />
      <View className={`absolute h-[52px] w-[53px] rounded-[10px] ${front}`}>
        {hasPin ? (
          <View className="absolute -top-1 left-[22px] h-2.5 w-2.5 rounded-full bg-illustration-line" />
        ) : null}
        <View className="absolute left-[19px] top-[13px] gap-1.5">
          {lines.map((width) => (
            <View key={width} className={`h-[3px] rounded-[2px] bg-illustration-line ${width}`} />
          ))}
        </View>
      </View>
    </View>
  );
}
