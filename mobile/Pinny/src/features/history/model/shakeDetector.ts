import { SHAKE } from '@/constants/shake';

export interface AccelerationSample {
  x: number;
  y: number;
  z: number;
}

type ShakeConfig = typeof SHAKE;

// Lógica pura do chacoalhar: recebe as leituras do acelerômetro e diz quando houve um.
// Um chacoalhar = requiredPeaks trancos dentro de windowMs, com pausa de cooldownMs depois.
export function createShakeDetector(config: ShakeConfig = SHAKE) {
  let peaks: readonly number[] = [];
  let lastShakeAt = -Infinity;

  return (sample: AccelerationSample, now: number): boolean => {
    if (now - lastShakeAt < config.cooldownMs) return false;

    const force = Math.hypot(sample.x, sample.y, sample.z) - 1;
    if (force < config.threshold) return false;

    peaks = [...peaks, now].filter((time) => now - time <= config.windowMs);
    if (peaks.length < config.requiredPeaks) return false;

    peaks = [];
    lastShakeAt = now;
    return true;
  };
}
