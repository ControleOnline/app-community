// Read-only projection: use the ERP client, not a list-loading store action.
export async function readCollection(api, endpoint, query) {
  const response = await api.fetch(endpoint, {params: query});
  const total = response?.totalItems ?? response?.['hydra:totalItems'];
  if (total === undefined || !Number.isFinite(Number(total))) throw new Error('Resposta sem total da coleção.');
  return {totalItems: Number(total), summary: response.summary || response['hydra:summary'] || {}};
}
