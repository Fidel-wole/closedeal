export interface User {
    _id?:string;
    firstname: string;
    lastname?: string;
    email: string;
    emailVerificationToken?: string;
    isEmailVerified?: boolean;
    password: string;
    passwordResetToken?: string;
  }
  