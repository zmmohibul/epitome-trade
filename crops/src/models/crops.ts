import mongoose from 'mongoose';

interface CropAttrs {
  title: string;
  price: number;
  userId: string;
}

interface CropDoc extends mongoose.Document {
  title: string;
  price: number;
  userId: string;
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
    },
    userId: {
      type: String,
      required: true,
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

const Crop = mongoose.model<CropDoc, CropModel>('Crop', cropSchema);

export { Crop };
