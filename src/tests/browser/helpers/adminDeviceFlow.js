'use strict';

/**
 * Stable parent re-export of the flowchart-1 device setup helpers.
 * Source of truth: @controleonline/ui-tests src/tests/helpers/adminDeviceFlow.js
 *
 * Child journey specs should import this module instead of copying login/device
 * flows. Credentials stay in env/Drive — never hardcode secrets here.
 */
module.exports = require('../../../../modules/controleonline/ui-tests/src/tests/helpers/adminDeviceFlow');
