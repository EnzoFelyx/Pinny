import { Accelerometer } from 'expo-sensors';

import { SHAKE } from '@/constants/shake';
import { isShakeToUndoEnabledAsync } from '@/modules/shake-to-undo';

import { createShakeDetector } from './shakeDetector';

// Serviço externo atrás de uma interface (REGRAS.md, regra 1): o ViewModel não conhece o
// acelerômetro nem o módulo nativo.
export interface ShakeService {
  // Há acelerômetro e o usuário não desligou o "Agitar para Desfazer" do sistema.
  isAvailable(): Promise<boolean>;
  // Avisa a cada chacoalhar. Devolve a função que para de ouvir.
  subscribe(onShake: () => void): () => void;
}

export const shakeService: ShakeService = {
  async isAvailable() {
    const [hasSensor, isEnabled] = await Promise.all([
      Accelerometer.isAvailableAsync(),
      isShakeToUndoEnabledAsync(),
    ]);
    return hasSensor && isEnabled;
  },

  subscribe(onShake) {
    const detect = createShakeDetector();
    Accelerometer.setUpdateInterval(SHAKE.sampleIntervalMs);
    const subscription = Accelerometer.addListener((sample) => {
      if (detect(sample, Date.now())) onShake();
    });
    return () => subscription.remove();
  },
};
