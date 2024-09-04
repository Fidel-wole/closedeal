import User from "../models/user";
import { comparePasswords, jsonwebtoken } from "../utils/functions";
import { User as UserInterface } from "../interfaces/user";

export default class AuthService {
  static async addUser(data: any) {
    try {
      return await User.create(data);
    } catch (err: any) {
      return err;
    }
  }
  static async findUserByEmail(email: string): Promise<any> {
    try {
      const user = await User.findOne({
        email: email,
      });
      return user;
    } catch (error: any) {
      return error;
    }
  }

  static async findUserById(id: string) {
    return await User.findById(id);
  }

  static async createToken(data: { email: string; password?: any }) {
    const user = await User.findOne({ email: data.email });

    if (!user) {
      throw new Error("User with the specified email not found");
    }

    if (data.password !== undefined) {
      const isMatch = await comparePasswords(data.password, user.password);

      if (!isMatch) {
        throw new Error("The password provided is invalid");
      }
    }

    const token = jsonwebtoken(user._id as any, user.email);

    return { token };
  }
  static async resetPassword(email: string) {
    try {
      const emailExist = await User.findOne({ email: email });
      if (!emailExist) {
        throw new Error("Email does not exist");
      } else {
        //send otp to email
        return emailExist;
      }
    } catch (err: any) {
      throw err;
    }
  }

  static async confirmOtp(otp:number){
    try{
    const otp = await User.findOne({})
    }catch(err:any){
      throw err
    }
  }
}
