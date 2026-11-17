import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { SNACKBAR_DURATION_MS } from '@/constants/limits';

import { Snackbar } from './Snackbar';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('Snackbar', () => {
  test('shows the message and the action, which runs on press', async () => {
    const onAction = jest.fn();
    await render(
      <Snackbar
        visible
        message="Cartão movido"
        actionLabel="Desfazer"
        onAction={onAction}
        onDismiss={jest.fn()}
      />,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Desfazer' }));

    expect(screen.getByText('Cartão movido')).toBeOnTheScreen();
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  test('has no button without an action', async () => {
    await render(<Snackbar visible message="Quadro apagado" onDismiss={jest.fn()} />);

    expect(screen.queryByRole('button')).toBeNull();
  });

  test('renders nothing while hidden', async () => {
    await render(<Snackbar visible={false} message="Cartão movido" onDismiss={jest.fn()} />);

    expect(screen.queryByText('Cartão movido')).toBeNull();
  });

  test('dismisses itself after the display time', async () => {
    const onDismiss = jest.fn();
    await render(<Snackbar visible message="Cartão movido" onDismiss={onDismiss} />);

    await act(() => jest.advanceTimersByTime(SNACKBAR_DURATION_MS - 1));
    const beforeTheTime = onDismiss.mock.calls.length;
    await act(() => jest.advanceTimersByTime(1));

    expect(beforeTheTime).toBe(0);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
