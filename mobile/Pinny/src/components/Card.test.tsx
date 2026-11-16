import { fireEvent, render, screen } from '@testing-library/react-native';

import { Card } from './Card';

const A11Y_LABEL = 'Cartão Estudar para a prova, prioridade alta';

describe('Card', () => {
  test('shows the title, labels, priority, deadline and checklist progress', async () => {
    await render(
      <Card
        title="Estudar para a prova"
        accessibilityLabel={A11Y_LABEL}
        labels={[{ id: 'study', name: 'Estudos', color: 'lavender' }]}
        priority="high"
        deadline={{ text: '17 mai · Atrasado', status: 'overdue' }}
        checklistText="2 de 5"
      />,
    );

    expect(screen.getByText('Estudar para a prova')).toBeOnTheScreen();
    expect(screen.getByLabelText('Etiqueta Estudos')).toBeOnTheScreen();
    expect(screen.getByLabelText('Prioridade alta')).toBeOnTheScreen();
    expect(screen.getByText('17 mai · Atrasado')).toBeOnTheScreen();
    expect(screen.getByText('2 de 5')).toBeOnTheScreen();
  });

  test('is a button read with the full description and opens on press', async () => {
    const onPress = jest.fn();
    await render(<Card title="Estudar" accessibilityLabel={A11Y_LABEL} onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: A11Y_LABEL }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('highlights the parts of the title found by the search', async () => {
    await render(
      <Card
        title="Estúdio de música"
        accessibilityLabel={A11Y_LABEL}
        titleParts={[
          { text: 'Estú', isMatch: true },
          { text: 'dio de música', isMatch: false },
        ]}
      />,
    );

    expect(screen.getByText('Estú')).toBeOnTheScreen();
    expect(screen.getByText('Estúdio de música')).toBeOnTheScreen();
  });

  test('becomes a checkbox in the selection mode', async () => {
    await render(<Card title="Estudar" accessibilityLabel={A11Y_LABEL} isSelected />);

    expect(screen.getByRole('checkbox', { name: A11Y_LABEL })).toBeChecked();
    expect(screen.queryByRole('button')).toBeNull();
  });

  test('reads as an unchecked checkbox when selection is drawn outside the card', async () => {
    await render(
      <Card title="Estudar" accessibilityLabel={A11Y_LABEL} accessibilitySelected={false} />,
    );

    expect(screen.getByRole('checkbox', { name: A11Y_LABEL })).not.toBeChecked();
  });

  test('offers the move actions to the screen reader only outside the selection mode', async () => {
    const actions = [{ name: 'moveUp', label: 'Mover para cima' }];
    const view = await render(
      <Card title="Estudar" accessibilityLabel={A11Y_LABEL} accessibilityActions={actions} />,
    );
    const outsideSelection = screen.getByRole('button').props.accessibilityActions;

    await view.rerender(
      <Card
        title="Estudar"
        accessibilityLabel={A11Y_LABEL}
        accessibilityActions={actions}
        isSelected={false}
      />,
    );

    expect(outsideSelection).toEqual(actions);
    expect(screen.getByRole('checkbox').props.accessibilityActions).toBeUndefined();
  });
});
