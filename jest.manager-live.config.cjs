const base=require('./jest.waiter.config.cjs');
module.exports={...base,roots:['<rootDir>/src/tests/integration'],
 setupFiles:['<rootDir>/src/tests/integration/setupLocalRuntime.cjs'],
 testMatch:['**/managerReads.live.test.js']};
