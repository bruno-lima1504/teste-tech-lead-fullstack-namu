// Data local de São Paulo (AAAA-MM-DD) de um instante, calculada pelo Intl, sem
// passar pelo código da aplicação: serve de referência independente nos testes.
const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export const saoPauloDate = (instant: Date): string => formatter.format(instant);
