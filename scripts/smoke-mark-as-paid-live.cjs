/* fluxo: financeiro-cobranca | etapa: autorizacao server-side | wikiPage: docs/wiki/Smoke-Test-Flows.md */
const assert = require("node:assert/strict");

const apiOrigin = String(process.env.SMOKE_API_ENTRYPOINT || "").replace(/\/$/, "");
const token = String(process.env.SMOKE_API_TOKEN || "");
const orderId = String(process.env.SMOKE_ORDER_ID || "");
const paymentType = String(process.env.SMOKE_AUTH_PAYMENT_TYPE || "");
const destinationWallet = String(process.env.SMOKE_AUTH_DESTINATION_WALLET || "");
const product = String(process.env.SMOKE_AUTH_PRODUCT || "");

if (!apiOrigin || !token || !orderId || !paymentType) {
  throw new Error("Configure SMOKE_API_ENTRYPOINT, SMOKE_API_TOKEN, SMOKE_ORDER_ID e SMOKE_AUTH_PAYMENT_TYPE antes de executar o smoke live.");
}

const headers = {Accept: "application/ld+json", "API-TOKEN": token, "Content-Type": "application/json"};
const requestJson = async (path, options = {}) => {
  const response = await fetch(`${apiOrigin}/${path.replace(/^\/+/, "")}`, {...options, headers: {...headers, ...(options.headers || {})}});
  const text = await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return {response, body};
};

(async () => {
const before = await requestJson(`orders/${orderId}`);
assert.equal(before.response.ok, true, `Pedido ${orderId} não está disponível para o smoke.`);

// Deliberately invalid cross-tenant references must be rejected by the API.
const attempted = await requestJson(`orders/${orderId}/mark-as-paid`, {
  method: "POST",
  body: JSON.stringify({product: "/products/999999999", paymentType: "/payment_types/999999999", destinationWallet: "/wallets/999999999", price: 999999.99}),
});
assert.ok([400, 403, 404, 422].includes(attempted.response.status), `O endpoint aceitou referências não autorizadas: HTTP ${attempted.response.status}`);

const after = await requestJson(`orders/${orderId}`);
assert.equal(after.response.ok, true, `Não foi possível reler o pedido ${orderId}.`);
assert.deepEqual({
  status: after.body?.status?.realStatus || after.body?.status?.status || null,
  price: after.body?.price ?? null,
  invoice: after.body?.invoice ?? null,
}, {
  status: before.body?.status?.realStatus || before.body?.status?.status || null,
  price: before.body?.price ?? null,
  invoice: before.body?.invoice ?? null,
}, "A tentativa rejeitada alterou o pedido.");

console.log(JSON.stringify({flow: "financeiro-cobranca", endpoint: `orders/${orderId}/mark-as-paid`, backend: apiOrigin, result: "rejected-without-mutation", httpStatus: attempted.response.status, orderUnchanged: true}));
const authorizedPayload = {paymentType};
if (destinationWallet) authorizedPayload.destinationWallet = destinationWallet;
if (product) authorizedPayload.product = product;
const authorized = await requestJson("orders/" + orderId + "/mark-as-paid", {
  method: "POST",
  body: JSON.stringify(authorizedPayload),
});
assert.equal(authorized.response.status, 200, "A referência autorizada não liquidou o pedido: HTTP " + authorized.response.status);
assert.equal(authorized.body?.outcome, "success", "A resposta autorizada não confirmou sucesso.");
assert.ok(["closed", "paid"].includes(String(authorized.body?.order?.realStatus || "").toLowerCase()), "A liquidação autorizada não terminou em PAGO/closed.");
assert.ok(["closed", "paid"].includes(String(authorized.body?.invoice?.realStatus || "").toLowerCase()), "A invoice autorizada não terminou em PAGO/closed.");
const settled = await requestJson("orders/" + orderId);
assert.equal(settled.response.ok, true, "Não foi possível reler o pedido liquidado " + orderId + ".");
assert.ok(["closed", "paid"].includes(String(settled.body?.status?.realStatus || settled.body?.status?.status || "").toLowerCase()), "O pedido relido não está PAGO/closed.");
console.log(JSON.stringify({flow: "financeiro-cobranca", endpoint: "orders/" + orderId + "/mark-as-paid", backend: apiOrigin, result: "authorized-settlement", httpStatus: authorized.response.status, orderStatus: authorized.body?.order?.realStatus, invoiceStatus: authorized.body?.invoice?.realStatus}));

})();
