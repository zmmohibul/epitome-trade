import { Message } from 'node-nats-streaming';
import { Listener, OrderCreatedEvent, Subjects } from '@miepitome/common';
import { queueGroupName } from './queue-group-name';
import { Crop } from "../../models/crops";
import { CropUpdatedPublisher } from '../publishers/crop-updated-publisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        // Find the crop that the order is reserving
        const crop = await Crop.findById(data.crop.id);

        // If no crop, throw error
        if (!crop) {
            throw new Error('Crop not found');
        }

        // Mark the crop as being reserved by setting its orderId property
        crop.set({ orderId: data.id });

        // Save the crop
        await crop.save();
        await new CropUpdatedPublisher(this.client).publish({
            id: crop.id,
            price: crop.price,
            title: crop.title,
            userId: crop.userId,
            orderId: crop.orderId,
            version: crop.version,
        });

        // ack the message
        msg.ack();
    }
}
