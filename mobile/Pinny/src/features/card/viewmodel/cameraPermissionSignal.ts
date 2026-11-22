// Aviso da folha que explica a câmera para a tela do cartão: o usuário liberou a câmera e a foto
// pode ser tirada assim que a folha fechar. A folha é outra tela, sem acesso ao estado do cartão.
type Listener = (isGranted: boolean) => void;

const listeners = new Set<Listener>();

export const cameraPermissionSignal = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  emit(isGranted: boolean): void {
    listeners.forEach((listener) => listener(isGranted));
  },
};
