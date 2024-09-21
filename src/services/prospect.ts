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
  static async getProspects(userId: string, page: number, limit: number) {
    try {
      const skip = (page - 1) * limit;
      const prospects = await Prospect.find({ userId })
        .skip(skip)
        .limit(limit)
        .exec();

      const total = await Prospect.countDocuments({ userId });

      if (prospects.length === 0) {
        return { message: "No more prospects available." };
      }

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
  static async searchProspects(userId: string, searchTerm: string, page: number, limit: number) {
    try {
      const skip = (page - 1) * limit;
      const searchRegex = new RegExp(searchTerm, 'i');

      const query = {
        userId,
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
          { company: searchRegex },
          { companyRole: searchRegex },
        ]
      };

      const prospects = await Prospect.find(query)
        .skip(skip)
        .limit(limit)
        .exec();

      const total = await Prospect.countDocuments(query);

      if (prospects.length === 0) {
        return { message: "No more prospects available." };
      }

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
