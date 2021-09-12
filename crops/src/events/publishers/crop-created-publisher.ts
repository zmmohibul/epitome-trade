import {CropCreatedEvent, Publisher, Subjects} from "@miepitome/common";

export class CropCreatedPublisher extends Publisher<CropCreatedEvent> {
    subject: Subjects.CropCreated = Subjects.CropCreated;
}