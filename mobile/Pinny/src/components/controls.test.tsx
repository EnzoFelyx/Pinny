import { fireEvent, render, screen } from '@testing-library/react-native';

import { Checkbox } from './Checkbox';
import { EmptyState } from './EmptyState';
import { Input } from './Input';
import { ProgressBar } from './ProgressBar';
import { Toggle } from './Toggle';

describe('Checkbox', () => {
  test('reads its state and toggles on press', async () => {
    const onToggle = jest.fn();
    await render(<Checkbox checked onToggle={onToggle} accessibilityLabel="Passagens" />);

    await fireEvent.press(screen.getByRole('checkbox', { name: 'Passagens' }));

    expect(screen.getByRole('checkbox', { name: 'Passagens' })).toBeChecked();
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});

describe('Toggle', () => {
  test('is a switch that asks for the opposite value on press', async () => {
    const onValueChange = jest.fn();
    await render(
      <Toggle value={false} onValueChange={onValueChange} accessibilityLabel="Notificações" />,
    );

    await fireEvent.press(screen.getByRole('switch', { name: 'Notificações' }));

    expect(screen.getByRole('switch', { name: 'Notificações' })).not.toBeChecked();
    expect(onValueChange).toHaveBeenCalledWith(true);
  });
});

describe('ProgressBar', () => {
  test('reports the progress as a percentage', async () => {
    await render(<ProgressBar progress={0.4} accessibilityLabel="2 de 5 subtarefas" />);

    expect(screen.getByRole('progressbar', { name: '2 de 5 subtarefas' })).toHaveAccessibilityValue(
      { min: 0, max: 100, now: 40 },
    );
  });

  test('keeps the value between 0 and 100', async () => {
    await render(<ProgressBar progress={1.8} accessibilityLabel="Progresso" />);

    expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({ now: 100 });
  });
});

describe('Input', () => {
  test('shows the label and reports what is typed', async () => {
    const onChangeText = jest.fn();
    await render(<Input label="Nome da pasta" value="" onChangeText={onChangeText} />);

    await fireEvent.changeText(screen.getByLabelText('Nome da pasta'), 'Pessoal');

    expect(screen.getByText('Nome da pasta')).toBeOnTheScreen();
    expect(onChangeText).toHaveBeenCalledWith('Pessoal');
  });

  test('keeps the label for the screen reader when it is hidden from the screen', async () => {
    await render(<Input label="Buscar quadro" isLabelHidden value="" onChangeText={jest.fn()} />);

    expect(screen.queryByText('Buscar quadro')).toBeNull();
    expect(screen.getByLabelText('Buscar quadro')).toBeOnTheScreen();
  });
});

describe('EmptyState', () => {
  test('shows the message and the action', async () => {
    await render(
      <EmptyState
        message="Nenhum cartão aqui ainda."
        action={<Checkbox checked={false} onToggle={jest.fn()} accessibilityLabel="Ação" />}
      />,
    );

    expect(screen.getByText('Nenhum cartão aqui ainda.')).toBeOnTheScreen();
    expect(screen.getByRole('checkbox', { name: 'Ação' })).toBeOnTheScreen();
  });
});
