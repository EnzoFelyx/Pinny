import { Check, Folder, Mic, Plus } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Checkbox } from '@/components/Checkbox';
import { Column } from '@/components/Column';
import { Fab } from '@/components/Fab';
import { Input } from '@/components/Input';
import { Label } from '@/components/Label';
import { PriorityChip } from '@/components/PriorityChip';
import { ProgressBar } from '@/components/ProgressBar';
import { Snackbar } from '@/components/Snackbar';
import { Toggle } from '@/components/Toggle';
import { ptBR } from '@/i18n/pt-BR';
import { colors } from '@/theme';

import { galleryText as text } from '../model/gallerySamples';
import {
  COLUMN_GAP,
  useComponentGalleryViewModel,
} from '../viewmodel/useComponentGalleryViewModel';
import { DevDataSection } from './components/DevDataSection';
import { GallerySection } from './components/GallerySection';

const PROGRESS_SAMPLE = 2 / 3;
const SCREEN_GUTTER = 16;

// Vitrine da biblioteca de componentes (etapa 3). Dá lugar à tela Início na etapa 5.
export function ComponentGalleryScreen() {
  const vm = useComponentGalleryViewModel();
  // Largura vem da tela em tempo de execução: caso permitido de style (REGRAS.md, regra 5).
  const columnStyle = { width: vm.columnWidth };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerClassName="gap-8 px-4 pb-24 pt-4">
        <Text accessibilityRole="header" className="text-display text-text-primary">
          {text.title}
        </Text>

        <DevDataSection />

        <GallerySection title={text.sections.buttons}>
          <Button label={text.confirm} icon={Check} onPress={vm.showSnackbar} />
          <Button label={text.edit} variant="secondary" onPress={vm.openSheet} />
          <Button label={text.createCard} disabled onPress={vm.noop} />
          <View className="flex-row gap-4">
            <Fab icon={Plus} accessibilityLabel={text.fabAdd} onPress={vm.openSheet} />
            <Fab icon={Mic} accessibilityLabel={text.fabVoice} onPress={vm.noop} />
          </View>
        </GallerySection>

        <GallerySection title={text.sections.tags}>
          <View className="flex-row flex-wrap gap-2">
            <Label name="Trabalho" color="lavender" />
            <Label name="Pessoal" color="mint" />
            <Label name="Pesquisa" color="peach" />
            <Label name="Planejamento" color="babyBlue" />
            <Label name="Ideias" color="butter" />
          </View>
          <View className="flex-row gap-2">
            <PriorityChip priority="high" />
            <PriorityChip priority="medium" />
            <PriorityChip priority="low" />
          </View>
        </GallerySection>

        <GallerySection title={text.sections.controls}>
          <View className="flex-row items-center gap-6">
            <Checkbox
              checked={vm.isChecked}
              onToggle={vm.toggleChecked}
              accessibilityLabel={text.checkboxLabel}
            />
            <Toggle
              value={vm.isToggleOn}
              onValueChange={vm.changeToggle}
              accessibilityLabel={text.toggleLabel}
            />
          </View>
          <ProgressBar progress={PROGRESS_SAMPLE} accessibilityLabel={text.progressLabel} />
        </GallerySection>

        <GallerySection title={text.sections.input}>
          <Input
            label={text.folderLabel}
            icon={Folder}
            placeholder={text.folderPlaceholder}
            value={vm.folderName}
            onChangeText={vm.changeFolderName}
          />
        </GallerySection>

        <GallerySection title={text.sections.columns}>
          {/* Prévia do quadro: colunas lado a lado, como no kanban da etapa 6. */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={vm.columnSnapInterval}
            decelerationRate="fast"
            className="-mx-4"
            contentContainerStyle={styles.columnsRow}
          >
            <View style={columnStyle}>
              <Column
                title={text.columnInProgress}
                cardCount={vm.cards.length}
                onAddCard={vm.noop}
                onOpenMenu={vm.noop}
              >
                {vm.cards.map((card) => (
                  <Card key={card.id} {...card} />
                ))}
              </Column>
            </View>
            <View style={columnStyle}>
              <Column
                title={text.columnTodo}
                cardCount={0}
                onAddCard={vm.noop}
                onOpenMenu={vm.noop}
              />
            </View>
          </ScrollView>
        </GallerySection>
      </ScrollView>

      <Snackbar
        visible={vm.isSnackbarVisible}
        message={text.snackbarMessage}
        actionLabel={ptBR.common.undo}
        onAction={vm.hideSnackbar}
        onDismiss={vm.hideSnackbar}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // SafeAreaView é de biblioteca de terceiros: StyleSheet (REGRAS.md, regra 5).
  screen: { flex: 1, backgroundColor: colors.background },
  // O espaço entre colunas precisa ser o mesmo usado no snap da rolagem.
  columnsRow: { alignItems: 'flex-start', gap: COLUMN_GAP, paddingHorizontal: SCREEN_GUTTER },
});
