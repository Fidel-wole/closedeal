export interface ICall {
    _id?: string;
    userId: string;
    startTime: Date;
    duration: number;
    transcript?: string;
}
