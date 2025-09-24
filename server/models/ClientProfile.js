import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Distinctive number sub-schema
const DistinctiveSchema = new Schema(
  {
    from: { type: String, trim: true },
    to: { type: String, trim: true },
  },
  { _id: false }
);

// Company sub-schema (updated to match frontend ShareHolding interface)
const CompanySchema = new Schema(
  {
    companyName: { type: String, required: true, trim: true },
    isinNumber: { type: String, trim: true },
    folioNumber: { type: String, trim: true },
    certificateNumber: { type: String, trim: true },
    distinctiveNumber: DistinctiveSchema, // ← Changed from 'distinctive' to 'distinctiveNumber'
    quantity: { type: Number, default: 0 }, // ← Add this missing field
    faceValue: { type: Number, default: 0 }, // ← Add this missing field
    purchaseDate: { type: Date } // ← Add this missing field
  },
  { _id: true }
);

// Bank details sub-schema
const BankDetailsSchema = new Schema(
  {
    bankNumber: { type: String, trim: true },
    branch: { type: String, trim: true },
    bankName: { type: String, trim: true },
    ifscCode: { type: String, uppercase: true, trim: true },
    micrCode: { type: String, trim: true },
  },
  { _id: false }
);

// Shareholder names sub-schema
const ShareholderNameSchema = new Schema(
  {
    name1: { type: String, required: true, trim: true },
    name2: { type: String, trim: true },
    name3: { type: String, trim: true },
  },
  { _id: false }
);

// Dividend sub-schema
const DividendSchema = new Schema(
  {
    amount: { type: Number, default: 0 },
    date: { type: Date },
  },
  { _id: false }
);

const ClientProfileSchema = new Schema(
  {
    shareholderName: ShareholderNameSchema,
    panNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    address: { type: String, trim: true },
    bankDetails: BankDetailsSchema,
    dematAccountNumber: { type: String, trim: true },

    // Array of multiple companies (make sure this matches frontend)
    companies: [CompanySchema], // Frontend uses 'shareHoldings' but backend uses 'companies'

    currentDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["Active", "Closed", "Pending", "Suspended"],
      default: "Active",
      index: true,
    },
    remarks: { type: String, trim: true },
    dividend: DividendSchema,
  },
  { timestamps: true }
);

export default model("ClientProfile", ClientProfileSchema);