import nats from 'node-nats-streaming';
import {CropCreatedPublisher} from "./events/crop-created-publisher";

console.clear();

const stan = nats.connect('epitometrade', 'abc', {
  url: 'http://localhost:4222',
});

stan.on('connect', async () => {
  console.log('Publisher connected to NATS');

  const publisher = new CropCreatedPublisher(stan);
  try {
    await publisher.publish({
      id: '123',
      title: 'concert',
      price: 20,
    });
  } catch (err) {
    console.error(err);
  }

});
