import { User } from "./user";

export interface IProspect {
    userId: User | string;
    firstName: string;
    lastName: string;
    email: string;
    workTelephone: string;
    company: string;
    companyCountry: string;
    companyCity: string;
    companyAddress: string;
    companyPostalCode: string;
    companyRole: string;
    aboutCompany?: string;
    customFields?: Record<string, string | number | boolean>; // If custom fields are allowed
    totalCalls?:number;
    totalDuration?:number
  }
  