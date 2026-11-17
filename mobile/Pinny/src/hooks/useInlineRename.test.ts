import { act, renderHook } from '@testing-library/react-native';

import { useInlineRename } from './useInlineRename';

async function renderRename(onRename?: (title: string) => void) {
  const onEditingChange = jest.fn();
  const { result } = await renderHook(() =>
    useInlineRename({ title: 'Pendentes', onRename, onEditingChange }),
  );
  return { result, onEditingChange };
}

describe('useInlineRename', () => {
  test('starts editing with the current title', async () => {
    const { result, onEditingChange } = await renderRename(jest.fn());

    await act(() => result.current.startEditing());

    expect(result.current).toMatchObject({ isEditing: true, draft: 'Pendentes' });
    expect(onEditingChange).toHaveBeenCalledWith(true);
  });

  test('saves the trimmed new name when editing ends', async () => {
    const onRename = jest.fn();
    const { result, onEditingChange } = await renderRename(onRename);
    await act(() => result.current.startEditing());
    await act(() => result.current.changeDraft('  A fazer  '));

    await act(() => result.current.finishEditing());

    expect(onRename).toHaveBeenCalledWith('A fazer');
    expect(result.current.isEditing).toBe(false);
    expect(onEditingChange).toHaveBeenLastCalledWith(false);
  });

  test('keeps the previous name when the field is left empty', async () => {
    const onRename = jest.fn();
    const { result } = await renderRename(onRename);
    await act(() => result.current.startEditing());
    await act(() => result.current.changeDraft('   '));

    await act(() => result.current.finishEditing());

    expect(onRename).not.toHaveBeenCalled();
  });

  test('does not save when the name did not change', async () => {
    const onRename = jest.fn();
    const { result } = await renderRename(onRename);
    await act(() => result.current.startEditing());

    await act(() => result.current.finishEditing());

    expect(onRename).not.toHaveBeenCalled();
  });

  test('is read-only without onRename', async () => {
    const { result, onEditingChange } = await renderRename();

    await act(() => result.current.startEditing());

    expect(result.current).toMatchObject({ canRename: false, isEditing: false });
    expect(onEditingChange).not.toHaveBeenCalled();
  });
});
