// Um cartão entra em "prazo próximo" quando faltam até estas horas para vencer.
export const DEADLINE_SOON_HOURS = 24;

// Tempo que o snackbar de "Desfazer" fica na tela antes de sumir sozinho.
export const SNACKBAR_DURATION_MS = 5000;

// Quantas ações o "Desfazer" (chacoalhar ou snackbar) consegue voltar.
export const HISTORY_LIMIT = 20;

// O banco avisa uma vez por linha alterada: avisos seguidos com menos que este intervalo entre
// eles viram uma recarga só das telas (ex.: duplicar uma coluna de 40 cartões gera ~80 avisos).
export const DATA_CHANGE_SETTLE_MS = 50;

// Filtro "Próximos dias" do quadro: cartões com prazo de hoje até esta quantidade de dias.
export const UPCOMING_DAYS = 7;
