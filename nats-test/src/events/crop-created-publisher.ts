import { Publisher } from './base-publisher';
import { Subjects } from './subjects';
import {CropCreatedEvent} from "./crop-created-event";

export class CropCreatedPublisher extends Publisher<CropCreatedEvent> {
  subject: Subjects.CropCreated = Subjects.CropCreated;
}
