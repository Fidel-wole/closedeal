import mongoose, { Schema, Document } from "mongoose";
import { User as UserInterface } from "../interfaces/user";

const userSchema = new Schema<UserDocument>(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, default: null },
    email: { type: String, unique: true, required: true },
    emailVerificationToken: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    password: { type: String, default: null },
    passwordResetToken: { type: String },
  },
  {
    timestamps: true,
  }
);

userSchema.virtual("fullname").get(function (this: UserDocument) {
  return `${this.firstname} ${this.lastname}`;
});

interface UserBase extends Omit<UserInterface, "_id"> {}

interface UserDocument extends UserBase, Document {}

const User = mongoose.model<UserDocument>("User", userSchema);

export default User;
