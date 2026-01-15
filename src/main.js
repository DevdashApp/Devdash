import express from 'express';
import { config } from 'dotenv';
config({ quiet: true });
import { getDopplerClient } from './utility/doppler.js';
import { load } from './utility/loadservices.js';

await getDopplerClient();

const app = express();

await load(app);

app.use(express.json());

app.use(express.static('src/public'));

app.use('/app*splat', express.static('src/app'));

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});