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
  static async getProspects(userId: string, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;
      const prospects = await Prospect.find({ userId })
        .skip(skip)
        .limit(limit)
        .exec();

      const total = await Prospect.countDocuments({ userId });

      return {
        prospects,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalProspects: total,
      };
    } catch (err: any) {
      throw err;
    }
  }
}
