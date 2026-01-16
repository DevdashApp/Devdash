import fs from 'node:fs';

export async function load(expressApp) {
    fs.readdirSync('./src/services').forEach(async (file) => {
        const { default: { routers, middlewares, frontendRouters } } = await import(`../services/${file}/main.js`);
        routers.forEach(router => expressApp.use(`/api/${file}`, router));
        middlewares.forEach(middleware => expressApp.use(`/api/${file}`, middleware));
        frontendRouters.forEach(router => expressApp.use(`/services/${file}/`, router));
    });
}