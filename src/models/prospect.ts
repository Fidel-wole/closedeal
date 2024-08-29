import mongoose, { Schema, model, Document } from "mongoose";
import { IProspect } from "../interfaces/prospect";

interface IProspectModel extends IProspect, Document {}

const ProspectSchema: Schema = new Schema<IProspectModel>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    workTelephone: { type: String },
    company: { type: String},
    companyCountry: { type: String },
    companyCity: { type: String},
    companyAddress: { type: String},
    companyPostalCode: { type: String },
    companyRole: { type: String },
    aboutCompany: { type: String },
    customFields: { type: Map, of: Schema.Types.Mixed }, // If custom fields are allowed
  },
  {
    timestamps: true,
  }
);

export const Prospect = model<IProspectModel>("Prospect", ProspectSchema);
