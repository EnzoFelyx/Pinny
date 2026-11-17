import { buildShakePrompt, type ShakePromptTexts } from './shakePrompt';

const texts: ShakePromptTexts = {
  undoAction: (name) => `Desfazer ${name}`,
  redoAction: (name) => `Refazer ${name}`,
  undo: 'Desfazer',
  redo: 'Refazer',
};

describe('buildShakePrompt', () => {
  test('has no prompt when there is nothing to undo or redo', () => {
    expect(buildShakePrompt(null, null, texts)).toBeNull();
  });

  test('names the action in the title when only undo is available', () => {
    expect(buildShakePrompt('Movimento', null, texts)).toEqual({
      title: 'Desfazer Movimento',
      options: [{ choice: 'undo', label: 'Desfazer' }],
    });
  });

  test('names the action in the title when only redo is available', () => {
    expect(buildShakePrompt(null, 'Movimento', texts)).toEqual({
      title: 'Refazer Movimento',
      options: [{ choice: 'redo', label: 'Refazer' }],
    });
  });

  test('offers both, each naming its action, with no title', () => {
    expect(buildShakePrompt('Criação', 'Movimento', texts)).toEqual({
      title: null,
      options: [
        { choice: 'undo', label: 'Desfazer Criação' },
        { choice: 'redo', label: 'Refazer Movimento' },
      ],
    });
  });
});
