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
    workTelephone: { type: String, required: true },
    company: { type: String, required: true },
    companyCountry: { type: String, required: true },
    companyCity: { type: String, required: true },
    companyAddress: { type: String, required: true },
    companyPostalCode: { type: String, required: true },
    companyRole: { type: String, required: true },
    aboutCompany: { type: String },
    customFields: { type: Map, of: Schema.Types.Mixed }, // If custom fields are allowed
  },
  {
    timestamps: true,
  }
);

export const Prospect = model<IProspectModel>("Prospect", ProspectSchema);
