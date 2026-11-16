import { render, screen } from '@testing-library/react-native';

import { Chip } from './Chip';
import { Label } from './Label';
import { PriorityChip } from './PriorityChip';

describe('Chip', () => {
  test('shows the text and is read by its label', async () => {
    await render(<Chip label="Hoje, 10h" tone="butter" accessibilityLabel="Prazo hoje às 10h" />);

    expect(screen.getByText('Hoje, 10h')).toBeOnTheScreen();
    expect(screen.getByLabelText('Prazo hoje às 10h')).toBeOnTheScreen();
  });

  test('is read by its own text when no label is given', async () => {
    await render(<Chip label="Estudos" tone="mint" />);

    expect(screen.getByLabelText('Estudos')).toBeOnTheScreen();
  });
});

describe('Label', () => {
  test('is announced as a label, not only by its name and color', async () => {
    await render(<Label name="Estudos" color="lavender" />);

    expect(screen.getByLabelText('Etiqueta Estudos')).toBeOnTheScreen();
  });
});

describe('PriorityChip', () => {
  test.each([
    ['low', 'Baixa', 'Prioridade baixa'],
    ['medium', 'Média', 'Prioridade média'],
    ['high', 'Alta', 'Prioridade alta'],
  ] as const)('%s priority shows its text, not only a color', async (priority, text, label) => {
    await render(<PriorityChip priority={priority} />);

    expect(screen.getByText(text)).toBeOnTheScreen();
    expect(screen.getByLabelText(label)).toBeOnTheScreen();
  });
});
