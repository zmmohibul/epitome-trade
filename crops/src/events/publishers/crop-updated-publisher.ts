import {CropUpdatedEvent, Publisher, Subjects} from "@miepitome/common";

export class CropUpdatedPublisher extends Publisher<CropUpdatedEvent> {
    subject: Subjects.CropUpdated = Subjects.CropUpdated;
}