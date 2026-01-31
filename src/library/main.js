import cache from './cache.js';
import _logger from './logger.js';

const logger = (moduleName) => ({
    ..._logger,
    moduleName
});

export { cache, logger };