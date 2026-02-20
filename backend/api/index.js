// Register ts-node with transpileOnly
require('../register.js');

// Set transpileOnly before importing
process.env.TS_NODE_TRANSPILE_ONLY = 'true';

const app = require('../src/server').default;

module.exports = app;