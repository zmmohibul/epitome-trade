import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import { requireAuth, validateRequest, NotFoundError, OrderStatus, BadRequestError } from '@miepitome/common';
import { body } from 'express-validator';
import { Crop } from "../models/crop";
import { Order } from "../models/order";

const router = express.Router();

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

        const existingOrder = await Order.findOne({
            crop: crop,
            status: {
                $in: [
                    OrderStatus.Created,
                    OrderStatus.AwaitingPayment,
                    OrderStatus.Complete,
                ],
            },
        });
        if (existingOrder) {
            throw new BadRequestError('Ticket is already reserved');
        }

        res.send({});
    }
);

export { router as newOrderRouter };
