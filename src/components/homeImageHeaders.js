// Attach session credentials only to file downloads on the configured API origin.
export default function homeImageHeaders(uri, {api, domain, token}) {
  const origin = String(api || '').match(/^https?:\/\/[^/]+/i)?.[0];
  if (!origin || !token || !String(uri || '').startsWith(`${origin}/`)
      || !/\/files\/[^/?#]+\/download(?:[?#]|$)/i.test(uri)) return undefined;
  return {'API-TOKEN': token, 'App-Domain': domain};
}
// Downloads on the API authority must use its configured protocol.
export function resolveHomeImageUrl(uri, api) {
  const image = String(uri || '');
  const imageOrigin = image.match(/^https?:\/\/([^/]+)/i);
  const apiOrigin = String(api || '').match(/^https?:\/\/([^/]+)/i);
  if (!imageOrigin || !apiOrigin || imageOrigin[1] !== apiOrigin[1]
      || !/\/files\/[^/?#]+\/download(?:[?#]|$)/i.test(image)) return image;
  return apiOrigin[0] + image.slice(imageOrigin[0].length);
}

