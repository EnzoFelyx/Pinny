// Que aviso mostrar depois de mover um cartão:
// - 'shakeHint': na primeira vez, ensina que dá para chacoalhar (sem botão);
// - 'undoButton': quem não pode chacoalhar recebe sempre o botão "Desfazer" (CLAUDE.md, regra 15);
// - 'none': já conhece o chacoalhar, não precisa de aviso.
export type UndoNotice = 'shakeHint' | 'undoButton' | 'none';

export function decideUndoNotice(canShake: boolean, hasSeenShakeHint: boolean): UndoNotice {
  if (!canShake) return 'undoButton';
  return hasSeenShakeHint ? 'none' : 'shakeHint';
}
