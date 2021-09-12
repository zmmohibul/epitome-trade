import { Message } from 'node-nats-streaming';
import { Listener } from './base-listener';
import {CropCreatedEvent} from "./crop-created-event";
import {Subjects} from "./subjects";

export class CropCreatedListener extends Listener<CropCreatedEvent> {
  subject: Subjects.CropCreated = Subjects.CropCreated;
  queueGroupName = 'payments-service';

  onMessage(data: CropCreatedEvent['data'], msg: Message) {
    console.log('Event data!', data);

    msg.ack();
  }
}
