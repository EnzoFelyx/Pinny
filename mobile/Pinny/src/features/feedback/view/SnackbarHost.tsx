import { type LucideIcon, Vibrate } from 'lucide-react-native';

import { Snackbar } from '@/components/Snackbar';

import type { SnackbarIcon } from '../model/snackbarStore';

import { useSnackbarHostViewModel } from '../viewmodel/useSnackbarHostViewModel';

const icons: Record<SnackbarIcon, LucideIcon> = {
  shake: Vibrate,
};

// Mostra o snackbar global (montado uma vez, no layout raiz).
export function SnackbarHost() {
  const { current, dismiss } = useSnackbarHostViewModel();
  if (!current) return null;

  return (
    <Snackbar
      // Cada mensagem nova reinicia o tempo na tela, mesmo com o mesmo texto.
      key={current.id}
      visible
      message={current.message}
      actionLabel={current.action?.label}
      onAction={current.action?.onPress}
      onDismiss={dismiss}
      icon={current.icon ? icons[current.icon] : undefined}
    />
  );
}
