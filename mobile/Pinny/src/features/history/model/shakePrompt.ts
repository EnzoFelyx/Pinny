// Alerta do chacoalhar, igual ao "Agitar para Desfazer" do iOS:
// - só dá para desfazer: "Desfazer Movimento" com [Desfazer];
// - só dá para refazer: "Refazer Movimento" com [Refazer];
// - dá para os dois: sem título, com [Desfazer Movimento] e [Refazer Movimento];
// - nada no histórico: sem alerta (null). O "Cancelar" a View sempre acrescenta.
export type ShakeChoice = 'undo' | 'redo';

export interface ShakePromptOption {
  choice: ShakeChoice;
  label: string;
}

export interface ShakePrompt {
  title: string | null;
  options: ShakePromptOption[];
}

export interface ShakePromptTexts {
  undoAction: (actionName: string) => string;
  redoAction: (actionName: string) => string;
  undo: string;
  redo: string;
}

export function buildShakePrompt(
  undoName: string | null,
  redoName: string | null,
  texts: ShakePromptTexts,
): ShakePrompt | null {
  if (undoName && redoName) {
    return {
      title: null,
      options: [
        { choice: 'undo', label: texts.undoAction(undoName) },
        { choice: 'redo', label: texts.redoAction(redoName) },
      ],
    };
  }
  if (undoName) {
    return { title: texts.undoAction(undoName), options: [{ choice: 'undo', label: texts.undo }] };
  }
  if (redoName) {
    return { title: texts.redoAction(redoName), options: [{ choice: 'redo', label: texts.redo }] };
  }
  return null;
}
