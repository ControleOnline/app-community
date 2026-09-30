const path = require('node:path');
const Module = require('node:module');

function browserModulePath(root, filename, production = process.env.APP_ENV !== 'dev') {
  if (!production) return filename;
  const source = path.join(root, 'modules', 'controleonline') + path.sep;
  const absolute = path.resolve(filename);
  if (!absolute.startsWith(source)) return filename;
  return path.join(root, 'node_modules', '@controleonline', absolute.slice(source.length));
}

// Published browser fixtures retain root-relative imports into sibling UI packages.
// Only the Playwright process uses this adapter; application Metro stays unchanged.
function installBrowserModuleResolver(root) {
  if (process.env.APP_ENV === 'dev') return;
  const previous = Module._resolveFilename;
  Module._resolveFilename = function(request, parent, ...args) {
    if (typeof request === 'string' && (request.startsWith('.') || path.isAbsolute(request))) {
      const absolute = path.resolve(path.dirname(parent?.filename || root), request);
      request = browserModulePath(root, absolute);
    }
    return previous.call(this, request, parent, ...args);
  };
}

module.exports = {browserModulePath, installBrowserModuleResolver};
