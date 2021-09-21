import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface CropAttrs {
    title: string;
    price: number;
    userId: string;
}

interface CropDoc extends mongoose.Document {
    title: string;
    price: number;
    userId: string;
    version: number;
    orderId?: string;
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
        orderId: {
            type: String,
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

cropSchema.statics.build = (attrs: CropAttrs) => {
    return new Crop(attrs);
};

const Crop = mongoose.model<CropDoc, CropModel>('Crop', cropSchema);

export { Crop };
