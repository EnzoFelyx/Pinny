import { createId } from '@/utils/id';

export interface SnackbarAction {
  label: string;
  onPress: () => void;
}

// Ícones conhecidos do snackbar. O Model guarda só o tipo; a View escolhe o desenho.
export type SnackbarIcon = 'shake';

export interface SnackbarOptions {
  action?: SnackbarAction;
  icon?: SnackbarIcon;
}

export interface SnackbarMessage extends SnackbarOptions {
  id: string;
  message: string;
}

type Listener = () => void;

// Um único snackbar para o app inteiro: uma mensagem nova substitui a anterior.
let current: SnackbarMessage | null = null;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => listener());
}

export const snackbarStore = {
  show(message: string, options: SnackbarOptions = {}): void {
    current = { id: createId(), message, ...options };
    notify();
  },

  hide(): void {
    current = null;
    notify();
  },

  getSnapshot(): SnackbarMessage | null {
    return current;
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
