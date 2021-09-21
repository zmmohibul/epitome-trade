import { Message } from 'node-nats-streaming';
import { Subjects, Listener, CropCreatedEvent } from '@miepitome/common';
import { Crop } from '../../models/crop';
import { queueGroupName } from './queue-group-name';

export class CropCreatedListener extends Listener<CropCreatedEvent> {
  subject: Subjects.CropCreated = Subjects.CropCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: CropCreatedEvent['data'], msg: Message) {
    const { id, title, price } = data;

    const crop = Crop.build({
      id,
      title,
      price,
    });
    await crop.save();

    msg.ack();
  }
}
