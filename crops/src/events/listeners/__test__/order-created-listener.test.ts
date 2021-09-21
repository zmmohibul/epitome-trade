import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { OrderCreatedEvent, OrderStatus } from '@miepitome/common';
import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Crop } from "../../../models/crops";

const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // Create and save a crop
  const crop = Crop.build({
    title: 'concert',
    price: 99,
    userId: 'asdf',
  });
  await crop.save();

  // Create the fake data event
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: 'alskdfj',
    expiresAt: 'alskdjf',
    crop: {
      id: crop.id,
      price: crop.price,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, crop, data, msg };
};

it('sets the userId of the crop', async () => {
  const { listener, crop, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedCrop = await Crop.findById(crop.id);

  expect(updatedCrop!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
  const { listener, crop, data, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('publishes a crop updated event', async () => {
  const { listener, crop, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const cropUpdatedData = JSON.parse(
      (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(data.id).toEqual(cropUpdatedData.orderId);
});
