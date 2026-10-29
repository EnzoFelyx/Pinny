import { Layers2, Plus } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { GlassIconButton } from '@/components/GlassIconButton';
import { ptBR } from '@/i18n/pt-BR';
import { colors } from '@/theme';

interface HomeHeaderProps {
  dateText: string;
  greeting: string;
  onCreateFolder: () => void;
}

const LOGO_ICON_SIZE = 20;

export function HomeHeader({ dateText, greeting, onCreateFolder }: HomeHeaderProps) {
  return (
    <View className="gap-[18px]">
      <View className="flex-row items-center justify-between">
        <View
          accessible
          accessibilityLabel={ptBR.appName}
          className="flex-row items-center gap-[9px]"
        >
          <View className="h-[30px] w-[30px] items-center justify-center rounded-[10px] bg-lavender">
            <Layers2 size={LOGO_ICON_SIZE} color={colors.onSecondary} />
          </View>
          <Text className="text-brand lowercase text-on-secondary">{ptBR.appName}</Text>
        </View>
        <GlassIconButton
          icon={Plus}
          accessibilityLabel={ptBR.folders.createFolderA11y}
          onPress={onCreateFolder}
        />
      </View>

      <View className="gap-1.5">
        <Text className="text-body uppercase text-text-secondary">{dateText}</Text>
        <Text accessibilityRole="header" className="text-hero text-text-primary">
          {greeting}
        </Text>
      </View>
    </View>
  );
}
