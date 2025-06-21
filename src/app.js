import express from 'express';
import routes from './routes/index.js';
import { globalErrorHandler } from './utils/GlobalErrorHandler.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api', routes);

app.use(globalErrorHandler);

export default app; 