const {
  groupPaidOrdersSeries,
  isPaidOrder,
  mapSummarySeries,
} = require('../../components/manager-preview/groupPaidOrdersSeries');

describe('groupPaidOrdersSeries', () => {
  it('detects paid statuses', () => {
    expect(isPaidOrder({status: {realStatus: 'paid'}})).toBe(true);
    expect(isPaidOrder({status: {status: 'open'}})).toBe(false);
    expect(isPaidOrder({status: {status: 'unpaid'}})).toBe(false);
  });

  it('groups by day for short windows', () => {
    const orders = [
      {status: {realStatus: 'paid'}, paymentDate: '2026-11-01T12:00:00Z'},
      {status: {realStatus: 'paid'}, paymentDate: '2026-11-01T18:00:00Z'},
      {status: {realStatus: 'paid'}, paymentDate: '2026-11-02T09:00:00Z'},
    ];
    const series = groupPaidOrdersSeries(orders, {
      from: new Date('2026-11-01T00:00:00Z'),
      to: new Date('2026-11-07T23:59:59Z'),
      longPeriodDays: 60,
    });
    expect(series).toEqual([
      {key: '2026-11-01', label: '11-01', orders: 2},
      {key: '2026-11-02', label: '11-02', orders: 1},
    ]);
  });

  it('groups by month when span exceeds threshold', () => {
    const orders = [
      {status: {realStatus: 'paid'}, paymentDate: '2026-01-15T12:00:00Z'},
      {status: {realStatus: 'paid'}, paymentDate: '2026-03-10T12:00:00Z'},
    ];
    const series = groupPaidOrdersSeries(orders, {
      from: new Date('2026-01-01T00:00:00Z'),
      to: new Date('2026-12-31T23:59:59Z'),
      longPeriodDays: 60,
    });
    expect(series.map((s) => s.key)).toEqual(['2026-01', '2026-03']);
  });

  it('maps summary series shape', () => {
    expect(mapSummarySeries([{date: '2026-11-01', count: 3}])).toEqual([
      {key: '2026-11-01', label: '2026-11-01', orders: 3},
    ]);
  });
});
