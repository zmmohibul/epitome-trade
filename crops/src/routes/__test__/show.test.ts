import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

it('returns a 404 if the crop is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app).get(`/api/crops/${id}`).send().expect(404);
});

it('returns the crop if the crop is found', async () => {
  const title = 'rice';
  const price = 20;

  const response = await request(app)
    .post('/api/crops')
    .set('Cookie', global.signin())
    .send({
      title,
      price,
    })
    .expect(201);

  const cropResponse = await request(app)
    .get(`/api/crops/${response.body.id}`)
    .send()
    .expect(200);

  expect(cropResponse.body.title).toEqual(title);
  expect(cropResponse.body.price).toEqual(price);
});
