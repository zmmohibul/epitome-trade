import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Crop } from '../../models/crop';

const buildCrop = async () => {
    const crop = Crop.build({
        title: 'rice',
        price: 20,
    });
    await crop.save();

    return crop;
};

it('fetches orders for an particular user', async () => {
    // Create three crops
    const cropOne = await buildCrop();
    const cropTwo = await buildCrop();
    const cropThree = await buildCrop();

    const userOne = global.signin();
    const userTwo = global.signin();
    // Create one order as User #1
    await request(app)
        .post('/api/orders')
        .set('Cookie', userOne)
        .send({ cropId: cropOne.id })
        .expect(201);

    // Create two orders as User #2
    const { body: orderOne } = await request(app)
        .post('/api/orders')
        .set('Cookie', userTwo)
        .send({ cropId: cropTwo.id })
        .expect(201);
    const { body: orderTwo } = await request(app)
        .post('/api/orders')
        .set('Cookie', userTwo)
        .send({ cropId: cropThree.id })
        .expect(201);

    // Make request to get orders for User #2
    const response = await request(app)
        .get('/api/orders')
        .set('Cookie', userTwo)
        .expect(200);

    // Make sure we only got the orders for User #2
    expect(response.body.length).toEqual(2);
    expect(response.body[0].id).toEqual(orderOne.id);
    expect(response.body[1].id).toEqual(orderTwo.id);
    expect(response.body[0].crop.id).toEqual(cropTwo.id);
    expect(response.body[1].crop.id).toEqual(cropThree.id);
});
