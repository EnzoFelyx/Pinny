// Um cartão entra em "prazo próximo" quando faltam até estas horas para vencer.
export const DEADLINE_SOON_HOURS = 24;

// Prazo novo de um cartão: amanhã, nesta hora (o usuário ajusta na folha "Data e horário").
export const DEFAULT_DUE_HOUR = 9;

// Fotos anexadas: o lado maior da foto guardada (bem acima da tela do iPhone, sem ocupar o espaço
// de uma foto da câmera inteira), a largura da miniatura (a lista do cartão mostra 72pt a 3x) e a
// qualidade do JPEG. Na galeria, até PHOTO_PICK_LIMIT fotos de uma vez.
export const PHOTO_MAX_EDGE = 2048;
export const PHOTO_THUMBNAIL_WIDTH = 320;
export const PHOTO_JPEG_QUALITY = 0.85;
export const PHOTO_PICK_LIMIT = 10;

// Trava de navegação (openRoute): depois de abrir uma tela ou folha, outro "abrir" nesse intervalo
// é ignorado (cobre a animação de entrada; evita folhas empilhadas por toque duplo).
export const NAVIGATION_LOCK_MS = 600;

// Tempo que o snackbar de "Desfazer" fica na tela antes de sumir sozinho.
export const SNACKBAR_DURATION_MS = 5000;

// Quadros de cada pasta mostrados na Início: com mais que isso, o resto vira "+N ›", que abre a
// tela da pasta (a Início fica com altura previsível).
export const HOME_PREVIEW_BOARDS = 3;

// Quantos quadros de cada pasta podem ficar fixados na Início: o mesmo número que a Início mostra.
export const PINNED_BOARDS_PER_FOLDER = HOME_PREVIEW_BOARDS;

// Quantas pastas podem ficar fixadas no topo da Início ao mesmo tempo.
export const PINNED_FOLDERS_LIMIT = 3;

// Quantas ações o "Desfazer" (chacoalhar ou snackbar) consegue voltar.
export const HISTORY_LIMIT = 20;

// O banco avisa uma vez por linha alterada: avisos seguidos com menos que este intervalo entre
// eles viram uma recarga só das telas (ex.: duplicar uma coluna de 40 cartões gera ~80 avisos).
export const DATA_CHANGE_SETTLE_MS = 50;

// Filtro "Próximos dias" do quadro: cartões com prazo de hoje até esta quantidade de dias.
export const UPCOMING_DAYS = 7;
