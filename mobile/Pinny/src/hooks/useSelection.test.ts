import { act, renderHook } from '@testing-library/react-native';

import { useSelection } from './useSelection';

describe('useSelection', () => {
  test('starts outside the selection mode', async () => {
    const { result } = await renderHook(() => useSelection());

    expect(result.current).toMatchObject({ isSelecting: false, selectedIds: [], count: 0 });
  });

  test('ignores toggles outside the selection mode', async () => {
    const { result } = await renderHook(() => useSelection());

    await act(() => result.current.toggle('a'));

    expect(result.current.selectedIds).toEqual([]);
  });

  test('marks and unmarks items in the order they were chosen', async () => {
    const { result } = await renderHook(() => useSelection());
    await act(() => result.current.start());

    await act(() => result.current.toggle('b'));
    await act(() => result.current.toggle('a'));
    await act(() => result.current.toggle('b'));
    await act(() => result.current.toggle('c'));

    expect(result.current.selectedIds).toEqual(['a', 'c']);
    expect(result.current.count).toBe(2);
  });

  test('selects many without repeating the ones already marked', async () => {
    const { result } = await renderHook(() => useSelection());
    await act(() => result.current.start());
    await act(() => result.current.toggle('b'));

    await act(() => result.current.selectMany(['a', 'b', 'c']));

    expect(result.current.selectedIds).toEqual(['b', 'a', 'c']);
  });

  test('deselects many at once', async () => {
    const { result } = await renderHook(() => useSelection());
    await act(() => result.current.start());
    await act(() => result.current.selectMany(['a', 'b', 'c']));

    await act(() => result.current.deselectMany(['a', 'c', 'x']));

    expect(result.current.selectedIds).toEqual(['b']);
  });

  test('cancel leaves the mode and clears the selection', async () => {
    const { result } = await renderHook(() => useSelection());
    await act(() => result.current.start());
    await act(() => result.current.toggle('a'));

    await act(() => result.current.cancel());

    expect(result.current).toMatchObject({ isSelecting: false, selectedIds: [] });
  });
});
