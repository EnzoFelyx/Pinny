import { snackbarStore } from '@/features/feedback/model/snackbarStore';
import { historyStore } from '@/features/history/model/historyStore';

// Estado global do app (histórico do "Desfazer" e snackbar): limpo antes de cada teste, para um
// teste não enxergar o que o anterior deixou.
beforeEach(() => {
  historyStore.clear();
  snackbarStore.hide();
});
