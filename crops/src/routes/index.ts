import express, { Request, Response } from 'express';
import { Crop } from '../models/crops';

const router = express.Router();

router.get('/api/crops', async (req: Request, res: Response) => {
  const crops = await Crop.find({});

  res.send(crops);
});

export { router as indexCroptRouter };
