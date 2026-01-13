import express from 'express';
import { config } from 'dotenv';
config({ quiet: true });
import { getDopplerClient } from './utility/doppler.js';

await getDopplerClient();
const { default: { middleware: githubMiddleware, router: githubRouter } } = await import('./services/github/main.js');

const app = express();

app.use('/api/webhooks', githubMiddleware);
app.use(githubRouter);

app.use(express.json());

app.use(express.static('src/public'));

app.use('/app', express.static('src/app'));

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});