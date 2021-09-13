import mongoose from 'mongoose';
import { Order } from "./order";
import {OrderStatus} from "@miepitome/common";

interface CropAttrs {
  title: string;
  price: number;
}

export interface CropDoc extends mongoose.Document {
  title: string;
  price: number;
  isReserved(): Promise<boolean>;
}

interface CropModel extends mongoose.Model<CropDoc> {
  build(attrs: CropAttrs): CropDoc;
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

cropSchema.statics.build = (attrs: CropAttrs) => {
  return new Crop(attrs);
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
