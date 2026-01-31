import chalk from 'chalk';

const logger = {
    moduleName: 'module',
    log(...text) {
        console.log(chalk.white(`[${this.moduleName}]: `, ...text));
    },
    error(...text) {
        console.error(chalk.red(`[${this.moduleName}]: `, ...text));
    },
    warn(...text) {
        console.warn(chalk.yellow(`[${this.moduleName}]: `, ...text));
    },
    info(...text) {
        console.info(chalk.blue(`[${this.moduleName}]: `, ...text));
    }
};

export default logger;