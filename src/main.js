import express from 'express';
import path from 'path';
import { config } from 'dotenv';
config({ quiet: true });
import { getDopplerClient } from './utility/doppler.js';
import { load } from './utility/loadservices.js';

await getDopplerClient();

const app = express();

await load(app);

app.use(express.json());

app.use(express.static('src/public'));

app.use('/app', express.static('src/app'));

app.get('/app*splat', (req, res) => {
    res.sendFile(path.resolve('src/app/index.html'));
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});