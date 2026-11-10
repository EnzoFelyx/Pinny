// Comparação de busca sem diferenciar maiúsculas nem acentos ("estúdio" encontra "Estudio").
// NFD separa a letra do acento; o intervalo abaixo são os acentos combinantes do Unicode.
const COMBINING_MARKS = /[\u0300-\u036f]/g;

export function normalizeForSearch(value: string): string {
  return value.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase().trim();
}

// Trecho de um texto, marcado quando é o que a busca encontrou (marca-texto).
export interface TextPart {
  text: string;
  isMatch: boolean;
}

// Divide o texto nos trechos que contêm o termo (já normalizado), sem diferenciar acentos nem
// maiúsculas: "Estúdio" com "estu" vira [Estú][dio]. null = o termo não aparece no texto.
export function splitByMatch(value: string, term: string): TextPart[] | null {
  if (term.length === 0) return null;
  // Cada letra é normalizada sozinha, guardando de qual posição do original ela veio: o acento
  // some e os trechos achados voltam ao texto original com as posições certas.
  // origin[i] = início, no original, da letra que gerou a posição i do texto normalizado;
  // originEnd[i] = onde essa letra termina (emoji ocupa 2 posições).
  let normalized = '';
  const origin: number[] = [];
  const originEnd: number[] = [];
  let index = 0;
  for (const char of value) {
    const plain = char.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase();
    normalized += plain;
    for (let i = 0; i < plain.length; i += 1) {
      origin.push(index);
      originEnd.push(index + char.length);
    }
    index += char.length;
  }

  const parts: TextPart[] = [];
  let cursor = 0;
  let found = normalized.indexOf(term);
  while (found >= 0) {
    const start = origin[found] ?? value.length;
    const end = originEnd[found + term.length - 1] ?? value.length;
    if (start > cursor) parts.push({ text: value.slice(cursor, start), isMatch: false });
    parts.push({ text: value.slice(start, end), isMatch: true });
    cursor = end;
    found = normalized.indexOf(term, found + term.length);
  }
  if (parts.length === 0) return null;
  if (cursor < value.length) parts.push({ text: value.slice(cursor), isMatch: false });
  return parts;
}
