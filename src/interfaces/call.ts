import { User } from "./user";
import { IProspect } from "./prospect";
export interface ICall {
    userId: User | string;
    prospectId: IProspect | string;
    startTime: Date;
    endTime?: Date;
    duration?: number; 
}
