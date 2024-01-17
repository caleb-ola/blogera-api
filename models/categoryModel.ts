import mongoose from "mongoose";

interface CategoryTypes {
  title: string;
}

const CategorySchema = new mongoose.Schema<CategoryTypes>(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

const Category = mongoose.model<CategoryTypes>("Category", CategorySchema);

export default Category;
