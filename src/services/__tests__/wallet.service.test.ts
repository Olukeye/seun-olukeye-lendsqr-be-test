import { WalletService } from '../wallet.service';
import db from '../../config/database';
import {
  NotFoundError,
  InsufficientFundsError,
  DuplicateReferenceError,
} from '../../utils/errors';

jest.mock('../../config/database');
jest.mock('../user.service');

describe('WalletService', () => {
  let walletService: WalletService;
  const mockDb = db as jest.MockedFunction<typeof db>;

  beforeEach(() => {
    walletService = new WalletService();
    jest.clearAllMocks();
  });

  // ===============================
  // CREATE WALLET
  // ===============================
  describe('createWallet', () => {
    it('should create a wallet successfully', async () => {
      mockDb
        // insert wallet
        .mockReturnValueOnce({
          insert: jest.fn().mockResolvedValue([1]),
        } as any)
        // get created wallet
        .mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          first: jest.fn().mockResolvedValue({
            id: 27,
            user_id: 1,
            balance: 0,
            currency: 'NGN',
          }),
        } as any);

      const result = await walletService.createWallet(1);

      expect(result.id).toBe(1);
      expect(result.user_id).toBe(1);
      expect(result.balance).toBe(0);
    });
  });

  // ===============================
  // FUND WALLET
  // ===============================
  describe('fundWallet', () => {
    const fundData = {
      amount: 5000,
      reference: 'REF123456',
    };

    it('should fund wallet successfully', async () => {
      const mockTrx = jest.fn() as any;
      mockTrx.commit = jest.fn();
      mockTrx.rollback = jest.fn();

      mockDb.transaction = jest.fn().mockResolvedValue(mockTrx);

      mockTrx.mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null),
      } as any);

      mockTrx.mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockReturnThis(),
        forUpdate: jest.fn().mockResolvedValue({
          id: 27,
          user_id: 1,
          balance: 1000,
        }),
      } as any);

      mockTrx.mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        update: jest.fn().mockResolvedValue(1),
      } as any);

      mockTrx.mockReturnValueOnce({
        insert: jest.fn().mockResolvedValue([1]),
      } as any);

      const result = await walletService.fundWallet(1, fundData);

      expect(result.amount).toBe(5000);
      expect(mockTrx.commit).toHaveBeenCalled();
    });

    it('should throw DuplicateReferenceError for duplicate reference', async () => {
      const mockTrx = jest.fn() as any;
      mockTrx.commit = jest.fn();
      mockTrx.rollback = jest.fn();

      mockDb.transaction = jest.fn().mockResolvedValue(mockTrx);

      mockTrx.mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ id: 1 }),
      } as any);

      await expect(walletService.fundWallet(1, fundData)).rejects.toThrow(
        DuplicateReferenceError
      );
      expect(mockTrx.rollback).toHaveBeenCalled();
    });
  });

  // ===============================
  // TRANSFER FUNDS
  // ===============================
  describe('transferFunds', () => {
    it('should throw InsufficientFundsError when balance is low', async () => {
      const mockTrx = jest.fn() as any;
      mockTrx.commit = jest.fn();
      mockTrx.rollback = jest.fn();
      mockDb.transaction = jest.fn().mockResolvedValue(mockTrx);

      const userService = require('../user.service').default;
      userService.getUserByEmail = jest.fn().mockResolvedValue({
        id: 2,
        email: 'recipient@example.com',
      });

      mockTrx.mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockReturnThis(),
        forUpdate: jest.fn().mockResolvedValue({
          id: 1,
          user_id: 1,
          balance: 100, // insufficient
        }),
      } as any);

      mockTrx.mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockReturnThis(),
        forUpdate: jest.fn().mockResolvedValue({
          id: 2,
          user_id: 2,
          balance: 0,
        }),
      } as any);

      await expect(
        walletService.transferFunds(1, {
          account_no: '0977554339',
          amount: 500,
        })
      ).rejects.toThrow(InsufficientFundsError);

      expect(mockTrx.rollback).toHaveBeenCalled();
    });
  });

  // ===============================
  // WITHDRAW FUNDS
  // ===============================
  describe('withdrawFunds', () => {
    it('should throw InsufficientFundsError when balance is low', async () => {
      const mockTrx = jest.fn() as any;
      mockTrx.commit = jest.fn();
      mockTrx.rollback = jest.fn();

      mockDb.transaction = jest.fn().mockResolvedValue(mockTrx);

      mockTrx.mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockReturnThis(),
        forUpdate: jest.fn().mockResolvedValue({
          id: 1,
          user_id: 1,
          balance: 100,
        }),
      } as any);

      await expect(
        walletService.withdrawFund(1, {
          amount: 500,
          bankAccount: '0123456789',
          bankCode: '058',
        })
      ).rejects.toThrow(InsufficientFundsError);

      expect(mockTrx.rollback).toHaveBeenCalled();
    });
  });

  // ===============================
  // GET WALLET BY USER ID
  // ===============================
  describe('getWalletByUserId', () => {
    it('should return wallet when found', async () => {
      const mockWallet = {
        id: 1,
        user_id: 1,
        balance: 5000,
        currency: 'NGN',
      };

      mockDb.mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockWallet),
      } as any);

      const result = await walletService.getWalletByUserId(1);
      expect(result).toEqual(mockWallet);
    });

    it('should throw NotFoundError when wallet not found', async () => {
      mockDb.mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(walletService.getWalletByUserId(999)).rejects.toThrow(
        NotFoundError
      );
    });
  });
});
