import { renderHook } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';

import { usePeriodicRefresh } from './usePeriodicRefresh';

const INTERVAL_MS = 60_000;

describe('usePeriodicRefresh', () => {
  let changeListener: ((state: AppStateStatus) => void) | null;

  beforeEach(() => {
    jest.useFakeTimers();
    changeListener = null;
    Object.defineProperty(AppState, 'currentState', { value: 'active', configurable: true });
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, listener) => {
      changeListener = listener as (state: AppStateStatus) => void;
      return { remove: jest.fn() };
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('refreshes on every interval while the app is in front', async () => {
    const refresh = jest.fn();
    await renderHook(() => usePeriodicRefresh(refresh, INTERVAL_MS));

    jest.advanceTimersByTime(INTERVAL_MS * 2);

    expect(refresh).toHaveBeenCalledTimes(2);
  });

  test('stops in the background and refreshes right away when the app comes back', async () => {
    const refresh = jest.fn();
    await renderHook(() => usePeriodicRefresh(refresh, INTERVAL_MS));

    changeListener?.('background');
    jest.advanceTimersByTime(INTERVAL_MS * 3);
    const inBackground = refresh.mock.calls.length;
    changeListener?.('active');

    expect(inBackground).toBe(0);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  test('stops the timer when the screen closes', async () => {
    const refresh = jest.fn();
    const { unmount } = await renderHook(() => usePeriodicRefresh(refresh, INTERVAL_MS));

    await unmount();
    jest.advanceTimersByTime(INTERVAL_MS * 2);

    expect(refresh).not.toHaveBeenCalled();
  });
});
