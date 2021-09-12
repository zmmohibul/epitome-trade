import { Subjects } from './subjects';

export interface CropCreatedEvent {
  subject: Subjects.CropCreated;
  data: {
    id: string;
    title: string;
    price: number;
  };
}