import { Message } from 'node-nats-streaming';
import { Subjects, Listener, CropUpdatedEvent } from '@miepitome/common';
import { Crop } from '../../models/crop';
import { queueGroupName } from './queue-group-name';

export class CropUpdatedListener extends Listener<CropUpdatedEvent> {
  subject: Subjects.CropUpdated = Subjects.CropUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: CropUpdatedEvent['data'], msg: Message) {
    const ticket = await Crop.findById(data.id);

    if (!ticket) {
      throw new Error('Crop not found');
    }

    const { title, price } = data;
    ticket.set({ title, price });
    await ticket.save();

    msg.ack();
  }
}
