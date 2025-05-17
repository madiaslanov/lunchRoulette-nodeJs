import express from 'express';
import colors from 'colors';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import './config/db.js';
import placeRoutes from './routes/placeRoutes.js';
import gptRouts from "./routes/gptRouts.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/v1', placeRoutes);
app.use('/api/v1/chat', gptRouts);


app.get('', (req, res) => {
    res.status(200).send("<h1>Welcome to the Party</h1>");
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}`.white.bgMagenta));
