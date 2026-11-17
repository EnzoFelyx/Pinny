import { act, renderHook } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { type DestructiveConfirmRequest, useDestructiveConfirm } from './useDestructiveConfirm';
import { useMinimumDuration } from './useMinimumDuration';
import { useStableCallback } from './useStableCallback';

describe('useStableCallback', () => {
  test('keeps the same function while calling the latest version of the callback', async () => {
    const { result, rerender } = await renderHook(
      ({ prefix }: { prefix: string }) => useStableCallback((name: string) => `${prefix} ${name}`),
      { initialProps: { prefix: 'Oi,' } },
    );
    const first = result.current;

    await rerender({ prefix: 'Olá,' });

    expect(result.current).toBe(first);
    expect(first('Enzo')).toBe('Olá, Enzo');
  });
});

describe('useMinimumDuration', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('stays on for the minimum time even after it is turned off', async () => {
    const { result, rerender } = await renderHook(
      ({ isActive }: { isActive: boolean }) => useMinimumDuration(isActive, 300),
      { initialProps: { isActive: true } },
    );

    await rerender({ isActive: false });
    const beforeTheMinimum = result.current;
    await act(() => jest.advanceTimersByTime(300));

    expect(beforeTheMinimum).toBe(true);
    expect(result.current).toBe(false);
  });

  test('stays on past the minimum time while it is still active', async () => {
    const { result } = await renderHook(() => useMinimumDuration(true, 300));

    await act(() => jest.advanceTimersByTime(1000));

    expect(result.current).toBe(true);
  });
});

describe('useDestructiveConfirm', () => {
  const request: DestructiveConfirmRequest = {
    title: 'Apagar o quadro "Semana"?',
    message: 'As colunas e os cartões também vão embora.',
    confirmLabel: 'Apagar',
    cancelLabel: 'Cancelar',
  };

  test('opens the native alert with a cancel and a destructive button', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const onConfirm = jest.fn();
    const onCancel = jest.fn();

    await renderHook(() => useDestructiveConfirm(request, { onConfirm, onCancel }));

    expect(alert).toHaveBeenCalledWith(
      request.title,
      request.message,
      [
        { text: 'Cancelar', style: 'cancel', onPress: onCancel },
        { text: 'Apagar', style: 'destructive', onPress: onConfirm },
      ],
      { cancelable: true, onDismiss: onCancel },
    );
    alert.mockRestore();
  });

  test('opens nothing without a request', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    await renderHook(() =>
      useDestructiveConfirm(null, { onConfirm: jest.fn(), onCancel: jest.fn() }),
    );

    expect(alert).not.toHaveBeenCalled();
    alert.mockRestore();
  });
});
