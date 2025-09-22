import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const ShareholderSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true },
    pan: { type: String, required: true, uppercase: true, trim: true, index: true },
    type: { type: String, enum: ["Shareholder", "Stockholder"], required: true },
    linkedDmatAccount: { type: Types.ObjectId, ref: "DmatAccount" },
  },
  { timestamps: true }
);

export default model("Shareholder", ShareholderSchema);
