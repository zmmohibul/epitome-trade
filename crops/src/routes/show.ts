import express, { Request, Response } from 'express';
import { NotFoundError } from '@miepitome/common';
import { Crop } from '../models/crops';

const router = express.Router();

router.get('/api/crops/:id', async (req: Request, res: Response) => {
  const crop = await Crop.findById(req.params.id);

  if (!crop) {
    throw new NotFoundError();
  }

  res.send(crop);
});

export { router as showCropRouter };
