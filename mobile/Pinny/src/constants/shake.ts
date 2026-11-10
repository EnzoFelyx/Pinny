// Detecção do chacoalhar pelo acelerômetro (valores em g; 1 g = gravidade parado).
// Valores iniciais: ajustar no aparelho.
export const SHAKE = {
  // Intervalo entre leituras do acelerômetro, só enquanto o app está aberto.
  sampleIntervalMs: 50,
  // Aceleração além da gravidade que conta como um "tranco".
  threshold: 1.3,
  // Trancos necessários dentro da janela para valer como chacoalhar.
  requiredPeaks: 3,
  windowMs: 700,
  // Depois de um chacoalhar, ignora os seguintes por um tempo (evita desfazer duas vezes).
  cooldownMs: 1500,
} as const;
