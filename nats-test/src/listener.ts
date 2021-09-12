import nats from 'node-nats-streaming';
import { randomBytes } from 'crypto';
import { CropCreatedListener } from './events/crop-created-listener';

console.clear();

const stan = nats.connect('epitometrade', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222',
});

stan.on('connect', () => {
  console.log('Listener connected to NATS');

  stan.on('close', () => {
    console.log('NATS connection closed!')
    process.exit();
  });

  new CropCreatedListener(stan).listen();
});

process.on('SIGINT', () => stan.close());
process.on('SIGTERM', () => stan.close());
