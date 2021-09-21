import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCancelledEvent } from '@miepitome/common';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { Crop } from "../../../models/crops";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const orderId = new mongoose.Types.ObjectId().toHexString();
  const crop = Crop.build({
    title: 'concert',
    price: 20,
    userId: 'asdf',
  });
  crop.set({ orderId });
  await crop.save();

  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    crop: {
      id: crop.id,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { msg, data, crop, orderId, listener };
};

it('updates the crop, publishes an event, and acks the message', async () => {
  const { msg, data, crop, orderId, listener } = await setup();

  await listener.onMessage(data, msg);

  const updatedCrop = await Crop.findById(crop.id);
  expect(updatedCrop!.orderId).not.toBeDefined();
  expect(msg.ack).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
