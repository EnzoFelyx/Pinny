import { snackbarStore } from './snackbarStore';

describe('snackbarStore', () => {
  test('starts with no message', () => {
    expect(snackbarStore.getSnapshot()).toBeNull();
  });

  test('shows a message with its options', () => {
    const action = { label: 'Desfazer', onPress: jest.fn() };

    snackbarStore.show('Cartão movido', { action, icon: 'shake' });

    expect(snackbarStore.getSnapshot()).toMatchObject({
      message: 'Cartão movido',
      action,
      icon: 'shake',
    });
  });

  test('a new message replaces the previous one', () => {
    snackbarStore.show('Cartão movido');
    const first = snackbarStore.getSnapshot();

    snackbarStore.show('Coluna apagada');

    expect(snackbarStore.getSnapshot()?.message).toBe('Coluna apagada');
    expect(snackbarStore.getSnapshot()?.id).not.toBe(first?.id);
  });

  test('tells the listeners about each change until they unsubscribe', () => {
    const listener = jest.fn();
    const unsubscribe = snackbarStore.subscribe(listener);

    snackbarStore.show('Cartão movido');
    snackbarStore.hide();
    unsubscribe();
    snackbarStore.show('Coluna apagada');

    expect(listener).toHaveBeenCalledTimes(2);
  });
});
