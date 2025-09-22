import mongoose from "mongoose";

const { Schema, model } = mongoose;

const ClientProfileSchema = new Schema(
  {
    shareholderName: {
      name1: { type: String, required: true, trim: true },
      name2: { type: String, trim: true },
      name3: { type: String, trim: true },
    },
    panNumber: { type: String, required: true, uppercase: true, trim: true, index: true },
    address: { type: String, trim: true },
    bankDetails: {
      bankNumber: { type: String, trim: true },
      branch: { type: String, trim: true },
      bankName: { type: String, trim: true },
      ifscCode: { type: String, uppercase: true, trim: true },
      micrCode: { type: String, trim: true },
    },
    dematAccountNumber: { type: String, trim: true },
    companyName: { type: String, trim: true },
    isinNumber: { type: String, trim: true },
    folioNumber: { type: String, trim: true },
    certificateNumber: { type: String, trim: true },
    distinctiveNumber: {
      from: { type: String, trim: true },
      to: { type: String, trim: true },
    },
    currentDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["Active", "Closed", "Pending", "Suspended"], default: "Active", index: true },
    remarks: { type: String, trim: true },
    dividend: {
      amount: { type: Number, default: 0 },
      date: { type: Date },
    },
  },
  { timestamps: true }
);

export default model("ClientProfile", ClientProfileSchema);
