import fs from 'node:fs';

export async function load(expressApp) {
    fs.readdirSync('./src/services').forEach(async (file) => {
        const { default: { routers, middlewares } } = await import(`../services/${file}/main.js`);
        routers.forEach(router => expressApp.use(router));
        middlewares.forEach(middleware => expressApp.use(middleware));
    });
}