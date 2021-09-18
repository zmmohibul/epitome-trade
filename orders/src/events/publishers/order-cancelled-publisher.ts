import { Subjects, Publisher, OrderCancelledEvent } from '@miepitome/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
