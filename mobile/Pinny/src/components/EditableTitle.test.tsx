import { fireEvent, render, screen } from '@testing-library/react-native';

import { useInlineRename } from '@/hooks/useInlineRename';

import { EditableTitle } from './EditableTitle';

interface HarnessProps {
  onRename?: (title: string) => void;
  onPress?: () => void;
}

// O título como as telas o usam: o estado da edição vem do useInlineRename.
function Harness({ onRename, onPress }: HarnessProps) {
  const rename = useInlineRename({ title: 'Semana', onRename });
  return (
    <EditableTitle
      title="Semana"
      subtitle="Pessoal / 3 cartões"
      rename={rename}
      renameActionLabel="Renomear quadro"
      renameHint="Toque para renomear"
      inputLabel="Nome do quadro"
      onPress={onPress}
    />
  );
}

describe('EditableTitle', () => {
  test('shows the title as a header with the subtitle', async () => {
    await render(<Harness onRename={jest.fn()} />);

    expect(screen.getByRole('header', { name: 'Semana' })).toBeOnTheScreen();
    expect(screen.getByText('Pessoal / 3 cartões')).toBeOnTheScreen();
  });

  test('pressing the title edits it in place and leaving the field saves', async () => {
    const onRename = jest.fn();
    await render(<Harness onRename={onRename} />);

    await fireEvent.press(screen.getByRole('header', { name: 'Semana' }));
    await fireEvent.changeText(screen.getByLabelText('Nome do quadro'), 'Mês');
    await fireEvent(screen.getByLabelText('Nome do quadro'), 'blur');

    expect(onRename).toHaveBeenCalledWith('Mês');
    expect(screen.getByRole('header', { name: 'Semana' })).toBeOnTheScreen();
  });

  test('runs the screen action instead of editing when one is given', async () => {
    const onPress = jest.fn();
    await render(<Harness onRename={jest.fn()} onPress={onPress} />);

    await fireEvent.press(screen.getByRole('header', { name: 'Semana' }));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.queryByLabelText('Nome do quadro')).toBeNull();
  });

  test('is read-only without a rename handler', async () => {
    await render(<Harness />);

    await fireEvent.press(screen.getByRole('header', { name: 'Semana' }));

    expect(screen.queryByLabelText('Nome do quadro')).toBeNull();
    expect(screen.queryByHintText('Toque para renomear')).toBeNull();
  });
});
