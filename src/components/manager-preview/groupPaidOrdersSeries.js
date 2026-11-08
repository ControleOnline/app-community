/**
 * Build chart series from paid orders for the home "Movimento de pedidos" block.
 * Groups by day; when the span exceeds longPeriodDays, groups by month.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

export function resolveOrderPaidAt(order) {
  const raw =
    order?.paymentDate ||
    order?.paidAt ||
    order?.settledAt ||
    order?.alterDate ||
    order?.updatedAt ||
    order?.date ||
    order?.createdAt;
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isPaidOrder(order) {
  const status = String(
    order?.status?.realStatus ||
      order?.status?.status ||
      order?.status ||
      '',
  ).trim().toLowerCase();
  return ['paid', 'pago', 'settled', 'liquidado', 'closed', 'fechado', 'completed', 'concluido', 'concluído'].includes(status);
}

export function groupPaidOrdersSeries(orders, { from, to, longPeriodDays = 60 } = {}) {
  const list = Array.isArray(orders) ? orders : [];
  const points = [];
  for (const order of list) {
    if (!isPaidOrder(order)) continue;
    const paidAt = resolveOrderPaidAt(order);
    if (!paidAt) continue;
    if (from && paidAt < from) continue;
    if (to && paidAt > to) continue;
    points.push(paidAt);
  }

  if (!points.length) return [];

  const min = from || new Date(Math.min(...points.map((d) => d.getTime())));
  const max = to || new Date(Math.max(...points.map((d) => d.getTime())));
  const spanDays = Math.max(1, Math.ceil((max.getTime() - min.getTime()) / DAY_MS) + 1);
  const byMonth = spanDays > longPeriodDays;

  const buckets = new Map();
  for (const paidAt of points) {
    const key = byMonth
      ? `${paidAt.getUTCFullYear()}-${String(paidAt.getUTCMonth() + 1).padStart(2, '0')}`
      : paidAt.toISOString().slice(0, 10);
    buckets.set(key, (buckets.get(key) || 0) + 1);
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, ordersCount]) => ({
      key,
      label: byMonth ? key : key.slice(5),
      orders: ordersCount,
    }));
}

export function mapSummarySeries(series) {
  if (!Array.isArray(series)) return null;
  return series.map((item, index) => ({
    key: item.key || item.date || item.month || String(index),
    label: item.label || item.date || item.month || item.key || String(index),
    orders: Number(item.orders ?? item.count ?? item.total ?? item.value ?? 0) || 0,
  }));
}
