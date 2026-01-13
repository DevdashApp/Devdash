import { App, createNodeMiddleware } from "octokit";
import fs from "node:fs/promises";
import { Router } from "express";
import { getDopplerClient } from "../../utility/doppler.js";
await getDopplerClient();

const githubApp = new App({
    appId: process.env.GITHUB_APP_ID,
    privateKey: await fs.readFile("devdash-handler.pem", "utf-8"),
    oauth: {
        clientType: "oauth-app",
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
    webhooks: {
        secret: process.env.GITHUB_WEBHOOK_SECRET,
        path: "/api/webhooks",
    }
});

const router = new Router();

githubApp.oauth.on("token.created", async ({ token, octokit }) => {
    console.log("New user token created!");

    const { data: user } = await octokit.rest.users.getAuthenticated();
    console.log("User login:", user.login);
});

console.log("Install URL:", await githubApp.getInstallationUrl({
    state: "random_csrf_token",
}));

router.get('/api/github/oauth/login', async (req, res) => {
    res.redirect(await githubApp.getInstallationUrl({
        state: 'random_csrf_token'
    }));
});

router.get('/api/github/oauth/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) return res.status(400).send("Missing code");

    await githubApp.oauth.createToken({ code });

    res.redirect("/app/");
});

export default {
    routers: [router],
    middlewares: [createNodeMiddleware(githubApp.webhooks)]
};