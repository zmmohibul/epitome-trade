import request from 'supertest';
import { app } from '../../app';

const createCrop = () => {
  return request(app).post('/api/crops').set('Cookie', global.signin()).send({
    title: 'asldkf',
    price: 20,
  });
};

it('can fetch a list of crops', async () => {
  await createCrop();
  await createCrop();
  await createCrop();

  const response = await request(app).get('/api/crops').send().expect(200);

  expect(response.body.length).toEqual(3);
});
