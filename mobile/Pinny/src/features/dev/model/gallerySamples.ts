import type { ImageSourcePropType } from 'react-native';

import deskProposalPhoto from '@/assets/images/samples/desk-proposal.jpg';
import deskReferencesPhoto from '@/assets/images/samples/desk-references.jpg';
import type { CardDeadline, CardLabel } from '@/components/Card';
import type { Priority } from '@/features/card/model/card.types';

import type { DataSummary } from './devDataService';

// Dados fictícios da galeria de componentes (só para desenvolvimento, sai na etapa 5).
// As fotos vêm do Figma do projeto (geradas pela IA do Figma) e servem só de exemplo.

export interface GalleryCard {
  id: string;
  title: string;
  accessibilityLabel: string;
  labels: readonly CardLabel[];
  priority: Priority;
  deadline: CardDeadline;
  checklistText: string;
  thumbnail?: ImageSourcePropType;
}

const work: CardLabel = { id: 'work', name: 'Trabalho', color: 'lavender' };
const personal: CardLabel = { id: 'personal', name: 'Pessoal', color: 'mint' };
const research: CardLabel = { id: 'research', name: 'Pesquisa', color: 'peach' };

// Coluna "Em andamento": o primeiro e o último cartão têm foto.
export const galleryCards: readonly GalleryCard[] = [
  {
    id: 'proposal',
    title: 'Enviar proposta para a Marina',
    accessibilityLabel:
      'Cartão Enviar proposta para a Marina, com foto, prioridade alta, prazo hoje às 10h, em breve, 2 de 3 subtarefas',
    labels: [work],
    priority: 'high',
    deadline: { text: 'Hoje, 10h · Em breve', status: 'soon' },
    checklistText: '2/3',
    thumbnail: deskProposalPhoto,
  },
  {
    id: 'portfolio',
    title: 'Separar ideias para o portfólio',
    accessibilityLabel:
      'Cartão Separar ideias para o portfólio, prioridade baixa, prazo 20 de maio, 0 de 4 subtarefas',
    labels: [personal],
    priority: 'low',
    deadline: { text: '20 mai', status: 'normal' },
    checklistText: '0/4',
  },
  {
    id: 'week',
    title: 'Organizar a semana',
    accessibilityLabel:
      'Cartão Organizar a semana, prioridade média, concluído em 18 de maio, 3 de 3 subtarefas',
    labels: [personal],
    priority: 'medium',
    deadline: { text: '18 mai · Concluído', status: 'done' },
    checklistText: '3/3',
  },
  {
    id: 'references',
    title: 'Revisar referências',
    accessibilityLabel:
      'Cartão Revisar referências, com foto, prioridade alta, prazo 17 de maio, atrasado, 1 de 3 subtarefas',
    labels: [research],
    priority: 'high',
    deadline: { text: '17 mai · Atrasado', status: 'overdue' },
    checklistText: '1/3',
    thumbnail: deskReferencesPhoto,
  },
];

export const galleryText = {
  title: 'Componentes',
  sections: {
    buttons: 'Botões',
    tags: 'Etiquetas e prioridade',
    controls: 'Controles',
    input: 'Input',
    columns: 'Colunas (pressione um cartão)',
    data: 'Dados locais (etapa 4)',
  },
  confirm: 'Confirmar',
  edit: 'Editar',
  createCard: 'Criar cartão',
  openSheet: 'Abrir folha',
  showSnackbar: 'Mostrar snackbar',
  checkboxLabel: 'Subtarefa concluída',
  toggleLabel: 'Desfazer ao chacoalhar',
  progressLabel: '2 de 3 subtarefas',
  folderLabel: 'Nome da pasta',
  folderPlaceholder: 'Minha próxima ideia',
  snackbarMessage: 'Cartão movido para Concluído',
  fabAdd: 'Criar pasta ou quadro',
  fabVoice: 'Criar cartão por voz',
  columnInProgress: 'Em andamento',
  columnTodo: 'A fazer',
  data: {
    seed: 'Criar quadro de exemplo',
    move: 'Mover 1º cartão para a próxima coluna',
    delete: 'Excluir 1º cartão',
    clear: 'Apagar todos os dados',
    hint: 'Feche o app por completo e abra de novo: os totais devem continuar iguais.',
    summary: (s: DataSummary) =>
      `${s.folders} pastas · ${s.boards} quadros · ${s.columns} colunas · ${s.cards} cartões · ${s.checklistItems} subtarefas`,
    seeded: 'Quadro de exemplo criado.',
    moved: 'Cartão movido para a próxima coluna',
    deleted: 'Cartão excluído',
    undone: (description: string) => `Desfeito: ${description}`,
    cleared: 'Todos os dados foram apagados.',
    noCard: 'Nenhum cartão encontrado. Crie o quadro de exemplo primeiro.',
    error: 'Algo deu errado com os dados. Veja o terminal do Metro.',
  },
} as const;
