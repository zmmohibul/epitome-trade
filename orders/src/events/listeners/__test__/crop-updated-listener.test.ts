import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { CropUpdatedEvent } from '@miepitome/common';
import { CropUpdatedListener } from '../crop-updated-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Crop } from '../../../models/crop';

const setup = async () => {
  // Create a listener
  const listener = new CropUpdatedListener(natsWrapper.client);

  // Create and save a crop
  const crop = Crop.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await crop.save();

  // Create a fake data object
  const data: CropUpdatedEvent['data'] = {
    id: crop.id,
    version: crop.version + 1,
    title: 'new concert',
    price: 999,
    userId: 'ablskdjf',
  };

  // Create a fake msg object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  // return all of this stuff
  return { msg, data, crop, listener };
};

it('finds, updates, and saves a crop', async () => {
  const { msg, data, crop, listener } = await setup();

  await listener.onMessage(data, msg);

  const updatedCrop = await Crop.findById(crop.id);

  expect(updatedCrop!.title).toEqual(data.title);
  expect(updatedCrop!.price).toEqual(data.price);
  expect(updatedCrop!.version).toEqual(data.version);
});

it('acks the message', async () => {
  const { msg, data, listener } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event has a skipped version number', async () => {
  const { msg, data, listener, crop } = await setup();

  data.version = 10;

  try {
    await listener.onMessage(data, msg);
  } catch (err) {}

  expect(msg.ack).not.toHaveBeenCalled();
});
