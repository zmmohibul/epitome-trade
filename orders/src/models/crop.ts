import mongoose from 'mongoose';
import { Order } from "./order";
import {OrderStatus} from "@miepitome/common";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface CropAttrs {
  id: String;
  title: string;
  price: number;
}

export interface CropDoc extends mongoose.Document {
  title: string;
  price: number;
  version: number;
  isReserved(): Promise<boolean>;
}

interface CropModel extends mongoose.Model<CropDoc> {
  build(attrs: CropAttrs): CropDoc;
  findByEvent(event: { id: string, version: number }) : Promise<CropDoc | null>;
}

const cropSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

cropSchema.set('versionKey', 'version');
cropSchema.plugin(updateIfCurrentPlugin);

cropSchema.statics.findByEvent = (event: { id: string, version: number }) => {
  return Crop.findOne({
    _id: event.id,
    version: event.version - 1
  });
}
cropSchema.statics.build = (attrs: CropAttrs) => {
  return new Crop({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price
  });
};

cropSchema.methods.isReserved = async function () {
  const existingOrder = await Order.findOne({
    crop: this as any,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });

  return !!existingOrder;
}

const Crop = mongoose.model<CropDoc, CropModel>('Crop', cropSchema);

export { Crop };
