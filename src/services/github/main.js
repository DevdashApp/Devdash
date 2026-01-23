import { App, createNodeMiddleware, Octokit } from "octokit";
import fs from "node:fs/promises";
import { Router } from "express";
import path from "node:path";

const app = new App({
    appId: process.env.GITHUB_APP_ID,
    privateKey: await fs.readFile("devdash-handler.pem", "utf-8"),
    oauth: {
        clientType: "oauth-app",
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
    webhooks: {
        secret: process.env.GITHUB_WEBHOOK_SECRET,
        path: "/webhooks",
    },
});

const octokit = new Octokit();

const router = new Router();

router.get("/oauth/login", async (_req, res) => {
    res.redirect(
        await app.getInstallationUrl({
            state: "random_csrf_token",
        })
    );
});

router.get("/oauth/callback", async (req, res) => {
    const code = req.query.code;
    if (!code) return res.status(400).send("Missing code");

    await app.oauth.createToken({ code });
    res.redirect("/app/github");
});

app.oauth.on("token.created", async ({ token, app }) => {
    console.log("New user token created!");

    const { data: user } = await app.rest.users.getAuthenticated();
    console.log("User login:", user.login);
});

router.get("/profile/get", async (req, res) => {
    try {
        const { data } = await octokit.request(
            `GET /users/${req.query.username}`
        );
        res.json(data);
    } catch (err) {
        if (err.status == 404) {
            res.status(404).json({ error: "User not found" });
        } else {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
});

const frontendRouter = new Router();

frontendRouter.get("/:username", (req, res) => {
    res.sendFile(path.resolve('src/services/github/frontend/profile/index.html'));
});

frontendRouter.get('/:username/script.js', (req, res) => res.sendFile(path.resolve('src/services/github/frontend/profile/script.js')));
frontendRouter.get('/:username/style.css', (req, res) => res.sendFile(path.resolve('src/services/github/frontend/profile/style.css')));

export default {
    routers: [router],
    middlewares: [createNodeMiddleware(app.webhooks)],
    frontendRouters: [frontendRouter],
};