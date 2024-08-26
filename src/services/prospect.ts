import { Prospect } from "../models/prospect";
import { IProspect } from "../interfaces/prospect";

export default class ProspectService {
  static async addProspect(data: IProspect) {
    try {
      return await Prospect.create(data);
    } catch (err: any) {
      throw err;
    }
  }
  static async getProspects(userId: any) {
    try {
      return await Prospect.find({ userId: userId });
    } catch (err: any) {
      throw err;
    }
  }
}
