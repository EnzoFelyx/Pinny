// Comparação de busca sem diferenciar maiúsculas nem acentos ("estúdio" encontra "Estudio").
// NFD separa a letra do acento; o intervalo abaixo são os acentos combinantes do Unicode.
const COMBINING_MARKS = /[\u0300-\u036f]/g;

export function normalizeForSearch(value: string): string {
  return value.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase().trim();
}
