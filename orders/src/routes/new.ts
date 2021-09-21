import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import {
  requireAuth,
  validateRequest,
  NotFoundError,
  OrderStatus,
  BadRequestError,
} from '@miepitome/common';
import { body } from 'express-validator';
import { Crop } from '../models/crop';
import { Order } from '../models/order';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

router.post(
  '/api/orders',
  requireAuth,
  [
    body('cropId')
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('CropId must be provided'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { cropId } = req.body;

    // Find the crop the user is trying to order in the database
    const crop = await Crop.findById(cropId);
    if (!crop) {
      throw new NotFoundError();
    }

    // Make sure that this crop is not already reserved
    const isReserved = await crop.isReserved();
    if (isReserved) {
      throw new BadRequestError('Crop is already reserved');
    }

    // Calculate an expiration date for this order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // Build the order and save it to the database
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      crop,
    });
    await order.save();

    // Publish an event saying that an order was created
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      status: OrderStatus.Created,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      crop: {
        id: crop.id,
        price: crop.price,
      },
    });

    res.status(201).send(order);
  }
);

export { router as newOrderRouter };
