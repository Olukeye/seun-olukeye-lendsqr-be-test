import { Request, Response, NextFunction } from "express";
import userService from "../services/user.service";
import walletService from "../services/wallet.service";
import adjutorService from "../services/adjutor.service";
import { CreateUserDTO } from "../models/models/types";
import { generateToken } from "../utils/jwt";
import { BlacklistedUserError, NotFoundError } from "../utils/errors";


export class UserController {
 async register(req: Request, res: Response, next: NextFunction) {
  try {
    const data: CreateUserDTO = req.body;

    const isBlacklisted = await adjutorService.checkBlacklist(data.email);
    if (isBlacklisted) {
      throw new BlacklistedUserError();
    }

    const user = await userService.createUser(data);

    const wallet = await walletService.createWallet(user.id);

    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    res.status(201).json({
      status: `Wallet created for ${wallet.account_name} with account number ${wallet.account_no}`,
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
          account_no: wallet.account_no,
          provider: wallet.provider,
          account_name: `${user.first_name} ${user.last_name}`,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      const user = await userService.getUserByemail(email);
      
      if (!user) {
        throw new NotFoundError('User not found. Please register first.');
      }

      if (user.is_blacklisted) {
        throw new BlacklistedUserError('Your account has been suspended');
      }

      const wallet = await walletService.getWalletByUserId(user.id);

      const token = generateToken({
        userId: user.id,
        email: user.email,
      });

      res.status(200).json({
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
            account_no:wallet.account_no
          },
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

}
export default new UserController();