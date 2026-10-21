// Local preview resilience only. Writes and authentication failures are never replayed.
async function readWithTransientRetry(request, options = {}, {
  wait = ms => new Promise(resolve => setTimeout(resolve, ms)),
  canRetry = () => true,
} = {}) {
  try {
    return await request();
  } catch (error) {
    const transient = error?.name === 'TypeError' && /failed to fetch|fetch failed|network request failed|load failed/i.test(error.message || '');
    if (String(options.method || 'GET').toUpperCase() !== 'GET' || !transient || options.signal?.aborted || !canRetry()) throw error;
    await wait(200);
    if (options.signal?.aborted || !canRetry()) throw error;
    return request();
  }
}
module.exports = {readWithTransientRetry};
