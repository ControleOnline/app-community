function validateDevApiTarget({domain, api, socket}) {
  if (String(domain || '').replace(/\/$/, '') !== 'https://dev.controleonline.com') return;
  if (String(api || '').replace(/\/$/, '') !== 'https://dd.controleonline.com' ||
      String(socket || '').replace(/\/$/, '') !== 'wss://dd.controleonline.com') {
    throw new Error('Dev export requires dd.controleonline.com for API and WebSocket');
  }
}
if (require.main === module) {
  validateDevApiTarget({domain: process.env.DEPLOY_DOMAIN, api: process.env.DEPLOY_API, socket: process.env.DEPLOY_SOCKET});
}
module.exports = {validateDevApiTarget};
