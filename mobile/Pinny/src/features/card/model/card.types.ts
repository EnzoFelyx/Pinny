import type { LABEL_COLORS, PRIORITIES } from '@/db/schema';

// Os valores permitidos vivem no schema do banco; aqui só derivamos os tipos.
export type Priority = (typeof PRIORITIES)[number];

// Cores disponíveis para etiquetas (os acentos da paleta). Colunas não têm cor.
export type LabelColor = (typeof LABEL_COLORS)[number];

export type DeadlineStatus = 'normal' | 'soon' | 'overdue' | 'done';
