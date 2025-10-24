import db from "../config/database";
import { Wallet} from "../models/models/types";
import { NotFoundError} from "../utils/errors";
import logger from "../utils/logger";


export class WalletService {
  async getWalletById(id: number): Promise<Wallet> {
    const wallet = await db('wallets').where({id}).first()

    if(!wallet){
      throw new NotFoundError("Wallet not found")
    }

    return wallet;
  }


   async craeteWallet(userId: number):Promise<Wallet> {
    try{

      const[walletId] = await db('wallets').insert({
        user_id:userId,
        balance:0,
        currency:"NGN"
      })

      const wallet = await this.getWalletById(walletId)

      logger.info(`Wallet created for user ${wallet}`);

      return wallet;
    }catch(error){
      logger.error('Error creating wallet:', error);
      throw new Error('Failed to create wallet');
    }
  }

  async getWalletByUserId(userId: number): Promise<Wallet>{
    const wallet = await db('wallets').where({user_id:userId}).first()

    if(!wallet){
      throw new NotFoundError("Wallet not found")
    }

    return wallet;
  }
}

export default new WalletService();