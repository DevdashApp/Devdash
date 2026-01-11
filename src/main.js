import express from 'express';

const app = express();

app.use(express.json());

app.use(express.static('src/public'));

app.use('/app', express.static('src/app'));

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});