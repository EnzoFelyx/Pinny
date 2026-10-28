import { View, type ViewStyle } from 'react-native';

interface ProgressBarProps {
  // De 0 a 1.
  progress: number;
  accessibilityLabel: string;
}

const PERCENT = 100;

export function ProgressBar({ progress, accessibilityLabel }: ProgressBarProps) {
  const percent = Math.round(Math.min(Math.max(progress, 0), 1) * PERCENT);
  // Largura calculada em tempo de execução: caso permitido de style (REGRAS.md, regra 5).
  const fillStyle: ViewStyle = { width: `${percent}%` };

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: PERCENT, now: percent }}
      className="h-[6px] w-full overflow-hidden rounded-full bg-border"
    >
      <View className="h-full rounded-full bg-primary" style={fillStyle} />
    </View>
  );
}
