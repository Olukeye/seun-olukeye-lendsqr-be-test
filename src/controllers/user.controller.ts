import { Request, Response, NextFunction } from "express";
import userService from "../services/user.service";
import walletService from '../services/wallet.service';
import adjutorService from "../services/adjutor.service";
import { CreateUserDTO } from "../models/models/types";
import { generateToken } from "../utils/jwt";
import { BlacklistedUserError } from "../utils/errors";


export class UserController {
  async register(req: Request, res:Response, next:NextFunction){
    try{
      const data: CreateUserDTO = req.body;

      const isBlacklisted = await adjutorService.checkBlacklist(data.email)

      if(isBlacklisted){
        throw new BlacklistedUserError();
      }

      const user = await userService.createUser(data)

      const wallet = await walletService.craeteWallet(user.id)

      const token = generateToken({
        userId: user.id,
        email:user.email
      })


      res.status(201).json({
        status: 'success',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            phone: user.phone,
          },
          wallet: {
            id: wallet.id,
            balance: wallet.balance,
            currency: wallet.currency,
          },
          token,
        },
      });
    }catch(error){
      next(error);
    }
  }
}
export default new UserController();