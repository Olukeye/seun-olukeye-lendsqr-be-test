import db from "../config/database";
import { Wallet, FundWalletDTO, Transaction,WithdrawFundsDTO, TransactionType, TransactionStatus, TransferFundsDTO} from "../models/models/types";
import userService from "./user.service";
import { DuplicateReferenceError, InsufficientFundsError, NotFoundError} from "../utils/errors";
import { generateUniqueAccountNumber, generateUniqueSavingsId } from '../utils/uniqueIdGenerator'
import logger from "../utils/logger";


export class WalletService {
  async getWalletById(id: number): Promise<Wallet> {
    const wallet = await db('wallets').where({id}).first()

    if(!wallet){
      throw new NotFoundError("Wallet not found")
    }

    return wallet;
  }
  

  async getWalletAccountNumber(account_no: string): Promise<Wallet> {
    const wallet = await db('wallets').where({account_no}).first()

    if(!wallet){
      throw new NotFoundError("Wallet not found")
    }

    return wallet;
  }

 async createWallet(userId: number): Promise<Wallet> {
  try {
    const user = await db('users')
      .select('first_name', 'last_name')
      .where({ id: userId })
      .first();

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const accountName = `${user.first_name} ${user.last_name}`.trim();
    const accountNumber = generateUniqueAccountNumber();
    const savingsId = generateUniqueSavingsId();

    const [walletId] = await db('wallets').insert({
      user_id: userId,
      savings_id: savingsId,
      account_no: accountNumber,
      provider: 'lendsqr',
      account_name: accountName,
      balance: 0,
      currency: 'NGN',
    });

    const wallet = await this.getWalletById(walletId);

    return wallet;
  } catch (error) {
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

   async getTransactionById(id: number): Promise<Transaction> {
    const tranx = await db('transactions').where({ id }).first();
    
    if (!tranx) {
      throw new NotFoundError('Transaction not found');
    }
    
    return tranx;
  }

  async fundWallet(userId: number, data: FundWalletDTO):Promise<Transaction> {
    const tranx = await db.transaction();

    try{
      const existingTranx = await tranx('transactions').where({reference:data.reference}).first();
      if(existingTranx){
        await tranx.rollback();
        throw new DuplicateReferenceError()
      }

      const wallet = await tranx('wallets')
      .where({user_id:userId})
      .first()
      .forUpdate()
      
      if(!wallet){
        throw new NotFoundError("Wallet not found")
      }

      const newBalance = parseFloat(wallet.balance) + data.amount;
      await tranx('wallets')
        .where({id:wallet.id})
        .update({balance: newBalance})

      const [tranxId] = await tranx('transactions').insert({
        wallet_id:wallet.id,
        type: TransactionType.CREDIT,
        amount: data.amount,
        reference:data.reference,
        description:`Wallet funding via external source`,
        recipient_wallet_id: null,
        status: TransactionStatus.COMPLETED
      })

      await tranx.commit()

      const transaction = await this.getTransactionById(tranxId);
      logger.info(`Wallet ${wallet.id} funded with ${data.amount}`);

      return transaction;

    }catch(error){
      await tranx.rollback();
      if (error instanceof DuplicateReferenceError || error instanceof NotFoundError) {
        throw error;
      }

      logger.error('Error funding wallet:', error);
      throw new Error('Failed to fund wallet');
    }
  }

  async transferFunds(senderUserId:number, data:TransferFundsDTO):Promise<Transaction>{
    const trx = await db.transaction();
    try{
       const recipient = await userService.getUserById(senderUserId);
      if (!recipient) {
        await trx.rollback();
        throw new NotFoundError('Recipient not found');
      }

      const senderWallet = await trx('wallets')
          .where({user_id:senderUserId})
          .first()
          .forUpdate();
      
      const recipientWallet = await trx('wallets')
          .where({account_no:data.account_no})
          .first()
          .forUpdate()
      
      if(!senderUserId || !recipientWallet){
        await trx.rollback();
        throw new NotFoundError("Wallet not found")
      }

      if(senderWallet.id === recipientWallet.id){
        await trx.rollback()
        throw new Error("You can't self fund")
      }

      if(parseFloat(senderWallet.balance) < data.amount){
        await trx.rollback()
        throw new InsufficientFundsError()
      }
       
      const senderBalance = parseFloat(senderWallet.balance) - data.amount;
      await trx('wallets')
      .where({id: senderWallet.id})
      .update({balance: senderBalance});


      const recipientBalance = parseFloat(recipientWallet.balance) + data.amount;
      await trx('wallets')
      .where({id: recipientWallet.id})
      .update({balance: recipientBalance})


      const reference = `TXN${Date.now()}${senderWallet.id}`;
      const recipientFullName = `${recipient.first_name} ${recipient.last_name}`

      // sender transaction >>debit<<
      const [txnId] = await trx('transactions').insert({
        wallet_id:senderWallet.id,
        type:TransactionType.TRANSFER,
        amount: data.amount,
        description:data.description || `Transfer to ${recipientWallet.account_name}`,
        reference,
        recipient_wallet_id: recipientWallet.id,
        status:TransactionStatus.COMPLETED,
        metadata: JSON.stringify({ recipientWallet: recipientFullName }),
      })

      // recipient transaction >>credit<<
      await trx('transactions').insert({
        wallet_id:recipientWallet.id,
        type:TransactionType.CREDIT,
        amount:data.amount,
        reference: `${reference}_CREDIT`,
        description:data.description || `Transfer from  ${senderUserId}`,
        status:TransactionStatus.COMPLETED,
        metadata: JSON.stringify({ recipientWallet: senderUserId }),
      })

      await trx.commit();

      const transaction = await this.getTransactionById(txnId);
      logger.info(`Transfer of ${data.amount} from wallet ${senderWallet.id} to ${recipientWallet.id}`);

      return transaction;
    }catch(error){
      await trx.rollback();
      if (error instanceof DuplicateReferenceError || error instanceof NotFoundError) {
        throw error;
      }

      logger.error('Error funding wallet:', error);
      throw new Error('Failed to fund wallet');
    }
  }

  async withdrawFund(userId: number, data:WithdrawFundsDTO):Promise<Transaction> {
    const tranx = await db.transaction();
    try{
      const wallet = await tranx('wallets').where({user_id:userId}).first().forUpdate()

      if(!wallet){
        await tranx.rollback()
        throw new  NotFoundError("wallet not found")
      }

      if(parseFloat(wallet.balance) < data.amount){
        await tranx.rollback()
        throw new InsufficientFundsError()
      }

      const newBalance = parseFloat(wallet.balance) - data.amount;
      await tranx('wallets').where({id: wallet.id}).update({balance:newBalance})

      const reference = `WTH${Date.now()}${wallet.id}`;

      const[txnId] = await tranx('transactions').insert({
          wallet_id: wallet.id,
          type: TransactionType.DEBIT,
          amount: data.amount,
          reference,
          description: 'Withdrawal',
          status: 'completed',
          metadata: JSON.stringify({
            bank_account: data.bankAccount,
            bank_code: data.bankCode,
        }),
      });

      tranx.commit();

      const transaction = await this.getTransactionById(txnId)
      logger.info(`Withdrawal of ${data.amount} from wallet ${wallet.id}`)

      return transaction;
      
    }catch(error){
      await tranx.rollback();
      
      if (error instanceof NotFoundError || error instanceof InsufficientFundsError) {
        throw error;
      }
      
      logger.error('Error withdrawing funds:', error);
      throw new Error('Failed to withdraw funds');
    }
  }
}

export default new WalletService();