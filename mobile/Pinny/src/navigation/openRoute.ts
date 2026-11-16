import { type Href, router } from 'expo-router';

import { NAVIGATION_LOCK_MS } from '@/constants/limits';

// Rota que está na frente agora (nome do Expo Router e parâmetros), lida da navegação.
interface CurrentRoute {
  name: string;
  params?: object;
}

type CurrentRouteReader = () => CurrentRoute | undefined;

let readCurrentRoute: CurrentRouteReader = () => undefined;
let lockedUntil = 0;

// O layout raiz registra quem lê a rota da frente (useNavigationContainerRef).
export function registerCurrentRouteReader(reader: CurrentRouteReader): void {
  readCurrentRoute = reader;
}

// "/board/[boardId]" e o nome da rota "board/[boardId]/index" são a mesma tela.
function toRouteName(pathname: string): string {
  return pathname.replace(/^\//, '').replace(/\/index$/, '');
}

function isAlreadyInFront(href: Href): boolean {
  const current = readCurrentRoute();
  if (!current) return false;
  const pathname = typeof href === 'string' ? href : href.pathname;
  if (toRouteName(current.name) !== toRouteName(pathname)) return false;
  const params = typeof href === 'string' ? {} : (href.params ?? {});
  const currentParams: Record<string, unknown> = { ...current.params };
  return Object.entries(params).every(
    ([key, value]) => String(currentParams[key]) === String(value),
  );
}

// Trava global para abrir telas e folhas (pedido do autor, 2026-11-14): um toque duplo, ou dois
// toques rápidos em botões diferentes, não empilham a mesma folha (nem duas) uma sobre a outra.
// 1. Depois de abrir algo, outro pedido de abrir é ignorado por NAVIGATION_LOCK_MS (a animação de
//    entrada ainda está rodando e a rota nova pode ainda não estar no estado da navegação).
// 2. Uma rota que já está na frente, com os mesmos parâmetros, não abre de novo.
// Voltar (router.back) e trocar (router.replace) não passam pela trava.
export function openRoute(href: Href): void {
  const now = Date.now();
  if (now < lockedUntil || isAlreadyInFront(href)) return;
  lockedUntil = now + NAVIGATION_LOCK_MS;
  router.push(href);
}
