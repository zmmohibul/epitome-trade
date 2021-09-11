import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest } from '@miepitome/common';
import { Crop } from '../models/crops';


const router = express.Router();

router.post(
  '/api/crops',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be greater than 0'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;

    const crop = Crop.build({
      title,
      price,
      userId: req.currentUser!.id,
    });
    await crop.save();

    res.status(201).send(crop);
  }
);

export { router as createCropRouter };
