// Set transpileOnly before importing
process.env.TS_NODE_TRANSPILE_ONLY = 'true';

import app from '../src/server';

export default app;