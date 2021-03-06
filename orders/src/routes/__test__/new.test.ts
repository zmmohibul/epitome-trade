import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { OrderStatus } from "@miepitome/common";
import { Crop } from '../../models/crop';
import { natsWrapper } from '../../nats-wrapper';

it('returns an error if the crop does not exist', async () => {
  const cropId = new mongoose.Types.ObjectId();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ cropId })
    .expect(404);
});

it('returns an error if the crop is already reserved', async () => {
  const crop = Crop.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await crop.save();
  const order = Order.build({
    crop,
    userId: 'laskdflkajsdf',
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });
  await order.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ cropId: crop.id })
    .expect(400);
});

it('reserves a crop', async () => {
  const crop = Crop.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await crop.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ cropId: crop.id })
    .expect(201);
});

it('emits an order created event', async () => {
  const crop = Crop.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await crop.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ cropId: crop.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
