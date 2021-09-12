import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  validateRequest,
  NotFoundError,
  requireAuth,
  NotAuthorizedError,
} from '@miepitome/common';
import { Crop } from '../models/crops';
import { CropUpdatedPublisher } from "../events/publishers/crop-updated-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.put(
  '/api/crops/:id',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be provided and must be greater than 0'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      throw new NotFoundError();
    }

    if (crop.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    crop.set({
      title: req.body.title,
      price: req.body.price,
    });
    await crop.save();
    new CropUpdatedPublisher(natsWrapper.client).publish({
      id: crop.id,
      title: crop.title,
      price: crop.price,
      userId: crop.userId
    });

    res.send(crop);
  }
);

export { router as updateCropRouter };
