import { saoPauloDayRange, toSaoPauloIso } from '../sao-paulo-time';

describe('saoPauloDayRange', () => {
  it('vai da meia-noite à meia-noite de São Paulo (UTC-3)', () => {
    const range = saoPauloDayRange('2026-10-19');

    expect(range.start.toISOString()).toBe('2026-10-19T03:00:00.000Z');
    expect(range.end.toISOString()).toBe('2026-10-20T03:00:00.000Z');
  });

  it('vira o mês e o ano', () => {
    expect(saoPauloDayRange('2026-12-31').end.toISOString()).toBe('2027-01-01T03:00:00.000Z');
  });

  // Datas históricas de horário de verão: 2018-11-04 teve 23h (a meia-noite não
  // existiu) e 2019-02-16 teve 25h. Calcular o fim como "início + 1 dia" quebra aqui.
  it('dias seguidos se encaixam sem sobreposição nem buraco, inclusive no horário de verão', () => {
    expect(saoPauloDayRange('2018-11-04').end).toEqual(saoPauloDayRange('2018-11-05').start);
    expect(saoPauloDayRange('2019-02-16').end).toEqual(saoPauloDayRange('2019-02-17').start);
  });
});

describe('toSaoPauloIso', () => {
  it('exibe o instante UTC no horário de São Paulo, com o offset', () => {
    expect(toSaoPauloIso(new Date('2026-10-19T17:00:00Z'))).toBe('2026-10-19T14:00:00-03:00');
  });
});
