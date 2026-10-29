import { NativeTabs } from 'expo-router/native-tabs';

import calendarIcon from '@/assets/images/tabs/tab-calendar.png';
import homeIcon from '@/assets/images/tabs/tab-home.png';
import settingsIcon from '@/assets/images/tabs/tab-settings.png';
import templatesIcon from '@/assets/images/tabs/tab-templates.png';
import { ptBR } from '@/i18n/pt-BR';
import { colors } from '@/theme';

const text = ptBR.tabs;

// Ícones do Figma (Lucide), exceto Início: cartões empilhados no estilo do SF "rectangle.stack". iOS: SVG vetorial no Images.xcassets, em versão inativa e ativa
// (plugins/withTabBarIcons.js). Android: PNG 1x/2x/3x gerado a partir do mesmo SVG.
const TABS = [
  {
    name: 'index',
    label: text.home,
    icon: homeIcon,
    xcasset: { default: 'tab-home', selected: 'tab-home-active' },
  },
  {
    name: 'templates',
    label: text.templates,
    icon: templatesIcon,
    xcasset: { default: 'tab-templates', selected: 'tab-templates-active' },
  },
  {
    name: 'calendar',
    label: text.calendar,
    icon: calendarIcon,
    xcasset: { default: 'tab-calendar', selected: 'tab-calendar-active' },
  },
  {
    name: 'settings',
    label: text.settings,
    icon: settingsIcon,
    xcasset: { default: 'tab-settings', selected: 'tab-settings-active' },
  },
] as const;

// Tab bar nativa: no iOS 26 ganha o Liquid Glass do sistema.
export default function TabsLayout() {
  return (
    <NativeTabs
      iconColor={{ default: colors.textSecondary, selected: colors.onSecondary }}
      minimizeBehavior="onScrollDown"
    >
      {TABS.map((tab) => (
        // Sem rótulo visível (decisão do autor): o accessibilityLabel mantém o nome para o VoiceOver.
        <NativeTabs.Trigger key={tab.name} name={tab.name} accessibilityLabel={tab.label}>
          {/* iOS: ícones já coloridos do xcasset ("original" definido no plugin). Android: PNG pintado por iconColor. */}
          <NativeTabs.Trigger.Icon xcasset={tab.xcasset} src={tab.icon} />
          <NativeTabs.Trigger.Label hidden />
        </NativeTabs.Trigger>
      ))}
      {/*
        Busca: no iOS 26.1+, role="search" separa a aba num círculo de vidro ao lado da barra
        e, ao tocar, já foca a barra de busca nativa da tela (app/(tabs)/search).
      */}
      <NativeTabs.Trigger name="search" role="search" accessibilityLabel={text.search}>
        <NativeTabs.Trigger.Label hidden />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
