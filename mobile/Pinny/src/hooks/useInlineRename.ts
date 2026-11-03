import { useState } from 'react';

interface InlineRenameOptions {
  title: string;
  // Sem ele, o título é só leitura.
  onRename?: (title: string) => void;
  onEditingChange?: (isEditing: boolean) => void;
}

// Título editado ali mesmo (coluna, quadro): o campo começa com o nome atual, "OK" ou tocar fora
// salva, e nome vazio volta ao anterior.
export function useInlineRename({ title, onRename, onEditingChange }: InlineRenameOptions) {
  const [draft, setDraft] = useState<string | null>(null);

  const startEditing = () => {
    if (!onRename) return;
    setDraft(title);
    onEditingChange?.(true);
  };

  // Só no blur: o "OK" do teclado também tira o foco, então salvar aqui evita salvar duas vezes.
  const finishEditing = () => {
    const next = draft?.trim() ?? '';
    setDraft(null);
    onEditingChange?.(false);
    if (next && next !== title) onRename?.(next);
  };

  return {
    draft,
    isEditing: draft !== null,
    canRename: onRename !== undefined,
    changeDraft: setDraft,
    startEditing,
    finishEditing,
  };
}
