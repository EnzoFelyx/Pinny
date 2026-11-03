import { ScrollView, Text, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { ptBR } from '@/i18n/pt-BR';

import { useHomeViewModel } from '../viewmodel/useHomeViewModel';
import { FolderCard } from './components/FolderCard';
import { HomeHeader } from './components/HomeHeader';

const text = ptBR.folders;

// Tela Início: pastas e seus quadros. A busca fica na aba própria, ao lado da tab bar.
export function HomeScreen() {
  const vm = useHomeViewModel();

  return (
    <View className="flex-1 bg-background">
      {/* "automatic" deixa o iOS somar a área segura e a altura da tab bar de vidro. */}
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-[18px] px-6 pb-8 pt-2"
      >
        <HomeHeader
          dateText={vm.dateText}
          greeting={vm.greeting}
          onCreateFolder={vm.createFolder}
        />

        <View className="flex-row items-baseline justify-between">
          <Text accessibilityRole="header" className="text-subtitle text-text-primary">
            {text.sectionTitle}
          </Text>
          <Text className="text-caption text-text-secondary">{vm.folderCountText}</Text>
        </View>

        {vm.errorText ? (
          <Text accessibilityLiveRegion="polite" className="text-body text-alert">
            {vm.errorText}
          </Text>
        ) : null}

        {vm.emptyText ? <EmptyState message={vm.emptyText} /> : null}

        <View className="gap-3">
          {vm.folders.map((folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              onOpenBoard={vm.openBoard}
              actions={vm.folderActions}
              onCreateBoard={vm.createBoard}
              onOpenFolder={vm.openFolder}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
