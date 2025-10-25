import { Request, Response, NextFunction } from "express";
import { AuthRequest } from '../middleware/auth.middleware';
import walletService from '../services/wallet.service';
import { InsufficientFundsError, NotFoundError, } from "../utils/errors";
import { FundWalletDTO, TransferFundsDTO, WithdrawFundsDTO} from '../models/models/types';
import logger from "../utils/logger";
import { HttpStatusCode } from "axios";

export class WalletController {
  async transferFunds(req: AuthRequest, res:Response, next:NextFunction):Promise<void>{
    const userId = req.user!.userId;
      const data:TransferFundsDTO = req.body;
    try{
      if(!data.account_no || !data.amount || data.amount <= 0){
        throw new Error("Invalid recipient account number or amount provided.")
      }
      const transaction = await walletService.transferFunds(userId, data);

      res.status(HttpStatusCode.Ok).json({
        message:"Fund transfered successfully",
        data:{
          transaction: {
            id: transaction.id,
            reference: transaction.reference,
            amount: transaction.amount,
            type: transaction.type,
            recipientWalletId: transaction.recipient_wallet_id,
          },
        }
      })

    }catch(error){             
      logger.error('Error transferring funds:', error);
      throw new Error('Failed to transfer funds');
    }
  }
}
export default new WalletController();