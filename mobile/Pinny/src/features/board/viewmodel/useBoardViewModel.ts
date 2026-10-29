import { useEffect, useState } from 'react';

import { ptBR } from '@/i18n/pt-BR';

import { boardRepository } from '../model/boardRepository';

// Esqueleto da tela do quadro: o kanban em si chega na etapa 6.
export function useBoardViewModel(boardId: string) {
  const [title, setTitle] = useState('');
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    boardRepository
      .getById(boardId)
      .then((board) => {
        if (isActive) setTitle(board?.title ?? '');
      })
      .catch((error: unknown) => {
        console.warn('Falha ao carregar o quadro.', error);
        if (isActive) setErrorText(ptBR.common.loadError);
      });
    return () => {
      isActive = false;
    };
  }, [boardId]);

  return { title, errorText };
}
