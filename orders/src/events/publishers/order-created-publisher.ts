import { Publisher, OrderCreatedEvent, Subjects } from '@miepitome/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
