import { App, createNodeMiddleware, Octokit } from "octokit";
import fs from "node:fs/promises";
import { Router } from "express";
import { cache, logger as Logger } from '@devdash/library';
import path from "node:path";
import moment from "moment-timezone";
import countries from "i18n-iso-countries";
import jwt from "jsonwebtoken";

async function generateJwt() {
    const payload = {
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60, // expires in 60 seconds
        iss: process.env.GITHUB_APP_ID,
    };
    return jwt.sign(payload, process.env.GITHUB_PRIVATE_KEY.replace(/\\n/g, '\n'), { algorithm: "RS256" });
}

async function getUserOctokit(installationId) {
    // verify if a valid token already exists
    const cachedToken = cache.get(`github/installations/${installationId}`);
    if (cachedToken) {
        return new Octokit({ auth: cachedToken });
    }

    // generate app's jwt
    const jwtToken = await generateJwt();
    const appOctokit = new Octokit({ auth: `Bearer ${jwtToken}` });

    // get installation token
    const { data: { token, expires_at } } = await appOctokit.apps.createInstallationAccessToken({
        installation_id: installationId,
    });

    // cache token
    const expiryDate = new Date(expires_at);
    const ttl = Math.floor((expiryDate.getTime() - Date.now() - 300000) / 1000); // TTL in seconds
    cache.set(`github/installations/${installationId}`, token, ttl);

    return new Octokit({ auth: token });
}

countries.registerLocale((await import("i18n-iso-countries/langs/en.json", { with: { type: "json" } })).default);

const logger = Logger('github');

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

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

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

app.oauth.on("token.created", async ({ token, userOctokit }) => {
    console.log("New user token created!");

    const { data: user } = await userOctokit.rest.users.getAuthenticated();
    console.log("User login:", user.login);
});

router.get("/profile/get", async (req, res) => {
    try {
        const cachedData = cache.get(`github/profile/${req.query.username}`);
        if (cachedData && Object.keys(cachedData).length > 0) return res.json(cachedData);
        if (cachedData && Object.keys(cachedData).length === 0) return res.status(404).json({ error: "User not found" });

        const { data } = await octokit.request(`GET /users/${req.query.username}`);

        try {
            const response = await octokit.graphql(
                `query ($username: String!) {
                    user(login: $username) {
                        pronouns
                        location
                    }
                }`,
                { username: req.query.username }
            );

            data.pronouns = response.user.pronouns || "not set";
            if (response.user.location) {
                const countryCode = countries.getAlpha2Code(response.user.location, 'en');
                if (countryCode) {
                    const timezones = moment.tz.zonesForCountry(countryCode);
                    data.timezone = timezones.length > 0 ? timezones[0] : "unknown";
                }
            }
        } catch (e) {
            data.pronouns = "unknown";
            data.timezone = "unknown";
            console.error("GraphQL Error:", e.message);
        }

        cache.set(`github/profile/${req.query.username}`, data, 60 * 15);

        res.json(data);
    } catch (err) {
        if (err.status === 404) {
            res.status(404).json({ error: "User not found" });
            cache.set(`github/profile/${req.query.username}`, {}, 60 * 15);
        } else {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
});

router.get('/profile/readme', async (req, res) => {
    try {
        const { data: readmeData } = await octokit.request(`GET /repos/${req.query.owner}/${req.query.owner}/readme`);

        const { data: markdown } = await octokit.request("POST /markdown", {
            text: Buffer.from(readmeData.content, 'base64').toString('utf-8'),
        });

        res.json(markdown);
    } catch (e) {
        res.status(500).json({ error: "Internal Server Error" });
        console.error(e);
    }
});

const frontendRouter = new Router();

frontendRouter.get("/:username", (req, res) => {
    res.sendFile(path.resolve('src/services/github/frontend/profile/index.html'));
});

frontendRouter.get('/:username/script.js', (req, res) => res.sendFile(path.resolve('src/services/github/frontend/profile/script.js')));
frontendRouter.get('/:username/style.css', (req, res) => res.sendFile(path.resolve('src/services/github/frontend/profile/style.css')));
frontendRouter.get('/github-md.css', (req, res) => res.sendFile(path.resolve('src/services/github/frontend/github-md.css')));

logger.info("Github installation URL: ", await app.getInstallationUrl({
    state: "random_csrf_token",
}));
logger.info("Service is now ready.");

export default {
    routers: [router],
    middlewares: [createNodeMiddleware(app.webhooks)],
    frontendRouters: [frontendRouter],
};