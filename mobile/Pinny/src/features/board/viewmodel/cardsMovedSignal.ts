// Aviso da folha "Mover cartões" para o quadro: os cartões selecionados foram movidos e o modo de
// seleção pode fechar. A folha é outra tela, sem acesso ao estado do quadro.
type Listener = () => void;

const listeners = new Set<Listener>();

export const cardsMovedSignal = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  emit(): void {
    listeners.forEach((listener) => listener());
  },
};
