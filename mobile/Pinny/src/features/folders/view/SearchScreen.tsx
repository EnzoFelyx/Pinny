import { Stack } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { ptBR } from '@/i18n/pt-BR';
import { colors } from '@/theme';

import { useSearchViewModel } from '../viewmodel/useSearchViewModel';
import { FolderCard } from './components/FolderCard';

const text = ptBR.search;

// Aba de busca. O campo é a barra de busca nativa: no iOS 26+, tocar na aba já foca o campo.
export function SearchScreen() {
  const vm = useSearchViewModel();

  return (
    <View className="flex-1 bg-background">
      <Stack.SearchBar
        placeholder={text.placeholder}
        onChangeText={(event) => vm.changeQuery(event.nativeEvent.text)}
        tintColor={colors.primary}
      />
      {/* "automatic" deixa o iOS somar o cabeçalho, a área segura e a tab bar de vidro. */}
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardDismissMode="on-drag"
        contentContainerClassName="gap-3 px-6 pb-8 pt-2"
      >
        {vm.errorText ? (
          <Text accessibilityLiveRegion="polite" className="text-body text-alert">
            {vm.errorText}
          </Text>
        ) : null}
        {vm.hintText ? (
          <Text className="text-center text-body text-text-secondary">{vm.hintText}</Text>
        ) : null}
        {vm.noResultsText ? (
          <Text
            accessibilityLiveRegion="polite"
            className="text-center text-body text-text-secondary"
          >
            {vm.noResultsText}
          </Text>
        ) : null}

        {vm.folders.map((folder) => (
          <FolderCard key={folder.id} folder={folder} onOpenBoard={vm.openBoard} />
        ))}
      </ScrollView>
    </View>
  );
}
