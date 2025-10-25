import dotenv from 'dotenv';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { stream } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/errors.middlewares';

const app: Application = express();

dotenv.config();

app.use(helmet());
app.use(cors());

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later',
});

app.use('/api/', limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream }));

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'success',
    message: 'Demo Credit Wallet API is running',
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1/users", require("./routes/user.routes"));
app.use("/api/v1/wallet", require("./routes/wallet.routes"));

app.use(notFoundHandler);
app.use(errorHandler);

export default app;