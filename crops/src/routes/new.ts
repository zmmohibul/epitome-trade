import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest } from '@miepitome/common';
import { Crop } from '../models/crops';
import { CropCreatedPublisher } from "../events/publishers/crop-created-publisher";
import { natsWrapper } from "../nats-wrapper";


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
    await new CropCreatedPublisher(natsWrapper.client).publish({
      id: crop.id,
      title: crop.title,
      price: crop.price,
      userId: crop.userId,
      version: crop.version
    });

    res.status(201).send(crop);
  }
);

export { router as createCropRouter };
