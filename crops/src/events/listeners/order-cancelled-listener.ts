import { Listener, OrderCancelledEvent, Subjects } from '@miepitome/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Crop } from "../../models/crops";
import { CropUpdatedPublisher } from '../publishers/crop-updated-publisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const crop = await Crop.findById(data.crop.id);

    if (!crop) {
      throw new Error('Crop not found');
    }

    crop.set({ orderId: undefined });
    await crop.save();
    await new CropUpdatedPublisher(this.client).publish({
      id: crop.id,
      orderId: crop.orderId,
      userId: crop.userId,
      price: crop.price,
      title: crop.title,
      version: crop.version,
    });

    msg.ack();
  }
}
