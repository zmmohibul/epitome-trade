import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { CropCreatedEvent } from '@miepitome/common';
import { CropCreatedListener } from '../crop-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Crop } from '../../../models/crop';

const setup = async () => {
  // create an instance of the listener
  const listener = new CropCreatedListener(natsWrapper.client);

  // create a fake data event
  const data: CropCreatedEvent['data'] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it('creates and saves a crop', async () => {
  const { listener, data, msg } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // write assertions to make sure a crop was created!
  const crop = await Crop.findById(data.id);

  expect(crop).toBeDefined();
  expect(crop!.title).toEqual(data.title);
  expect(crop!.price).toEqual(data.price);
});

it('acks the message', async () => {
  const { data, listener, msg } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // write assertions to make sure ack function is called
  expect(msg.ack).toHaveBeenCalled();
});
