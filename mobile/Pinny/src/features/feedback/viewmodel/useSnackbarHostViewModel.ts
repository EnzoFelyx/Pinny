import { useSyncExternalStore } from 'react';

import { snackbarStore } from '../model/snackbarStore';

export function useSnackbarHostViewModel() {
  const current = useSyncExternalStore(snackbarStore.subscribe, snackbarStore.getSnapshot);
  return { current, dismiss: snackbarStore.hide };
}
