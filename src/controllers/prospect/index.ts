import ProspectService from "../../services/prospect";
import Dispatcher from "../../utils/dispatcher";
import { Request, Response } from "express";
import { CustomRequest } from "../../interfaces/custom-request";
import { IProspect } from "../../interfaces/prospect";

export default class ProspectController{
    static async addProspect(req:Request, res:Response){
        const {body} = req;
        const userId = (req as CustomRequest).userId;
        const prospectData : IProspect = {
            userId: userId,
            firstName: body.firstname,
            lastName: body.lastname,
            email: body.email,
            workTelephone: body.workTelephone,
            company: body.company,
            companyCountry: body.companyCountry,
            companyCity: body.companyCity,
            companyAddress: body.companyAddress,
            companyPostalCode: body.companyPostalCode,
            companyRole: body.companyRole,
            customFields:body.customFields
        }
        try{
            const prospect = await ProspectService.addProspect(prospectData);
            Dispatcher.DispatchSuccessMessage(res, "Prospect added successfully", prospect)
        }catch(err:any){
            Dispatcher.DispatchErrorMessage(res, err.message)
        }
    }
    static async getProspects(req:Request, res:Response){
        const {userId} = (req as CustomRequest)
        try{
        const prospects = await ProspectService.getProspects(userId)
        Dispatcher.DispatchSuccessMessage(res, "Prospects fetched", prospects);
        }catch(err:any){
            Dispatcher.DispatchErrorMessage(res, err.message)
        }
    }

    static async searchProspects(req: Request, res: Response) {
        const { userId } = req as CustomRequest;
        const { searchTerm, page, limit } = req.query;

        try {
            const searchResults = await ProspectService.searchProspects(
                userId,
                searchTerm as string,
                Number(page) || 1,
                Number(limit) || 10
            );
            Dispatcher.DispatchSuccessMessage(res, "Prospects searched successfully", searchResults);
        } catch (err: any) {
            Dispatcher.DispatchErrorMessage(res, err.message);
        }
    }
}