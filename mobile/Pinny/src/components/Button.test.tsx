import { fireEvent, render, screen } from '@testing-library/react-native';

import { Button } from './Button';

describe('Button', () => {
  test('calls onPress when pressed', async () => {
    const onPress = jest.fn();
    await render(<Button label="Salvar" onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Salvar' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('does not call onPress and reads as disabled when disabled', async () => {
    const onPress = jest.fn();
    await render(<Button label="Salvar" onPress={onPress} disabled />);

    await fireEvent.press(screen.getByRole('button', { name: 'Salvar' }));

    expect(onPress).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
  });

  test('exposes the hint to the screen reader', async () => {
    await render(<Button label="Criar" onPress={jest.fn()} accessibilityHint="Cria o quadro" />);

    expect(screen.getByHintText('Cria o quadro')).toBeOnTheScreen();
  });
});
