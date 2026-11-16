import { createShakeDetector } from './shakeDetector';

const CONFIG = {
  sampleIntervalMs: 50,
  threshold: 1.3,
  requiredPeaks: 3,
  windowMs: 700,
  cooldownMs: 1500,
} as const;

// Parado, o aparelho lê 1 g (a gravidade); um tranco passa bem disso.
const STILL = { x: 0, y: 0, z: 1 };
const JOLT = { x: 3, y: 0, z: 0 };

describe('createShakeDetector', () => {
  test('detects a shake on the third jolt inside the window', () => {
    const detect = createShakeDetector(CONFIG);

    expect(detect(JOLT, 0)).toBe(false);
    expect(detect(JOLT, 100)).toBe(false);
    expect(detect(JOLT, 200)).toBe(true);
  });

  test('ignores readings of the phone standing still', () => {
    const detect = createShakeDetector(CONFIG);

    const results = [0, 100, 200, 300].map((time) => detect(STILL, time));

    expect(results).toEqual([false, false, false, false]);
  });

  test('does not count jolts that are too far apart', () => {
    const detect = createShakeDetector(CONFIG);

    const results = [0, 400, 800].map((time) => detect(JOLT, time));

    expect(results).toEqual([false, false, false]);
  });

  test('ignores new jolts during the cooldown and detects again after it', () => {
    const detect = createShakeDetector(CONFIG);
    [0, 100, 200].forEach((time) => detect(JOLT, time));

    const duringCooldown = [300, 400, 500].map((time) => detect(JOLT, time));
    const afterCooldown = [1800, 1900, 2000].map((time) => detect(JOLT, time));

    expect(duringCooldown).toEqual([false, false, false]);
    expect(afterCooldown).toEqual([false, false, true]);
  });
});
