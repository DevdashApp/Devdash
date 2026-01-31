import chalk from 'chalk';

const moduleName = import.meta.url.split('/').pop().split('.')[0];

const logger = {
    log(...text) {
        console.log(chalk.white(`[${moduleName}]: `, ...text));
    },
    error(...text) {
        console.error(chalk.red(`[${moduleName}]: `, ...text));
    },
    warn(...text) {
        console.warn(chalk.yellow(`[${moduleName}]: `, ...text));
    },
    info(...text) {
        console.info(chalk.blue(`[${moduleName}]: `, ...text));
    }
};

export default logger;