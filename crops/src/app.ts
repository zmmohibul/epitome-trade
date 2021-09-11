import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@miepitome/common';
import { createCropRouter } from './routes/new';
import { showCropRouter } from './routes/show';
import { indexCroptRouter } from './routes/index';
import { updateCropRouter } from './routes/update';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);
app.use(currentUser);

app.use(createCropRouter);
app.use(showCropRouter);
app.use(indexCroptRouter);
app.use(updateCropRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
