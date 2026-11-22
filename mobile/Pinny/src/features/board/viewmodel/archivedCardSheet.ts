import type { CardLabel } from '@/components/Card';
import type { Priority } from '@/features/card/model/card.types';
import type { CardDetail } from '@/features/card/model/cardDetail';
import { formatDueDate } from '@/features/card/viewmodel/dueDateText';
import { ptBR } from '@/i18n/pt-BR';

import { formatArchivedValue } from './archivedItems';

const text = ptBR.board.archived.sheet;

// Cada linha de informação da folha; a View escolhe o ícone pelo tipo.
export type ArchivedInfoKind = 'column' | 'archived' | 'due' | 'checklist';

export interface ArchivedInfoRow {
  kind: ArchivedInfoKind;
  label: string;
  value: string;
  accessibilityLabel: string;
}

// Folha "Cartão arquivado" pronta para exibir (só leitura).
export interface ArchivedCardSheetView {
  boardId: string;
  title: string;
  // null = sem descrição (a folha não mostra o bloco).
  description: string | null;
  labels: CardLabel[];
  priority?: Priority;
  rows: ArchivedInfoRow[];
  unarchiveLabel: string;
}

function row(kind: ArchivedInfoKind, label: string, value: string): ArchivedInfoRow {
  return { kind, label, value, accessibilityLabel: text.rowA11y(label, value) };
}

function validDate(iso: string | null): Date | null {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

// Coluna de origem e quando foi arquivado sempre; prazo e checklist só quando o cartão tem.
export function toArchivedCardSheet(detail: CardDetail, now: Date): ArchivedCardSheetView {
  const { card, column, board, labels, checklist } = detail;
  const archivedAt = validDate(card.archivedAt);
  const dueAt = validDate(card.dueAt);
  const done = checklist.filter((item) => item.isDone).length;
  const rows = [
    row('column', text.columnRow, column.title),
    archivedAt ? row('archived', text.archivedRow, formatArchivedValue(archivedAt, now)) : null,
    dueAt ? row('due', text.dueRow, formatDueDate(dueAt, now)) : null,
    checklist.length > 0
      ? row('checklist', text.checklistRow, ptBR.card.steps.progress(done, checklist.length))
      : null,
  ].filter((item): item is ArchivedInfoRow => item !== null);
  const description = card.description?.trim() ?? '';
  return {
    boardId: board.id,
    title: card.title,
    description: description.length > 0 ? description : null,
    labels: labels.map((label) => ({ id: label.id, name: label.name, color: label.color })),
    priority: card.priority ?? undefined,
    rows,
    unarchiveLabel: text.unarchive(column.title),
  };
}
