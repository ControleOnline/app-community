import {env} from '@env';
import {domainProfile} from './localDomainTheme';

// Explicit local development routing; never send another environment's reads here.
export function orderMovementEndpoint(config = env, location = typeof window === 'undefined' ? null : window.location) {
  const local = config.LOCAL_ORDER_REPORTS;
  if (location && ['localhost','127.0.0.1','[::1]'].includes(location.hostname) &&
      local?.sourceApi === config.API_ENTRYPOINT && local?.domain === config.DOMAIN) {
    return new URL('orders', `${local.endpoint.replace(/\/$/, '')}/`).href;
  }
  return 'orders';
}

export function resolveOrderMovement(summary, period, totalItems) {
  const movement = summary?.movement;
  const series = period === 'all' ? movement?.monthly : movement?.daily;
  if (!Array.isArray(series) || Number(movement?.totals?.orders) !== totalItems ||
      !Number.isInteger(movement?.totals?.undatedOrders) || movement.totals.undatedOrders < 0) return null;
  if (series.some(row => !row?.key || !Number.isInteger(row.orders) || row.orders < 0)) return null;
  if (series.reduce((total,row)=>total+row.orders,0) + movement.totals.undatedOrders !== totalItems) return null;
  return {series, undatedOrders:movement.totals.undatedOrders};
}

// Local opt-in is scoped to the configured API AND domain; never inferred from rows.
export function orderValueMetric(config = env, location = typeof window === 'undefined' ? null : window.location) {
  const localEndpoint = orderMovementEndpoint(config, location);
  return domainProfile(config, location)?.valueMetric === 'paidOrders' ||
    (localEndpoint !== 'orders' && config.LOCAL_ORDER_REPORTS?.valueMetric === 'paidOrders')
    ? 'paidOrders' : 'sales';
}

export function resolvePaidOrderValue(summary) {
  const value = summary?.paidOrders;
  const totals = value?.totals;
  if (value?.basis !== 'order-price' || value?.status !== 'paid' || value?.realStatus !== 'open' ||
      !Number.isInteger(totals?.orders) || totals.orders < 0 || totals.unpricedOrders !== 0 ||
      typeof totals.amount !== 'number' || !Number.isFinite(totals.amount)) return null;
  return totals.amount;
}
