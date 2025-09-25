import sharedConfig from '../../eslint.config.mjs';

// Re-export the shared strict config so backend linting matches CI
export default [...sharedConfig];
