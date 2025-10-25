import request from 'supertest';
import app from '../app';
import db from '../config/database';
import { generateToken } from '../utils/jwt';

// ✅ Properly mock the Knex instance and its methods
jest.mock('../config/database', () => ({
  __esModule: true,
  default: {
    where: jest.fn(),
    first: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    transaction: jest.fn(),
    select: jest.fn(),
    count: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
    offset: jest.fn(),
    forUpdate: jest.fn(),
  },
}));

const mockDb = db as jest.Mocked<typeof db>;

describe('Wallet Routes', () => {
  let authToken: string;

  beforeEach(() => {
    jest.clearAllMocks();
    authToken = generateToken({ userId: 1, email: 'test@example.com' });
  });

  // -----------------------
  // GET /wallets/balance
  // -----------------------
  // describe('GET /api/v1/wallets/balance', () => {
  //   it('should return wallet balance for authenticated user', async () => {
  //     (mockDb.where as jest.Mock).mockReturnThis();
  //     (mockDb.first as jest.Mock).mockResolvedValueOnce({
  //       id: 1,
  //       user_id: 1,
  //       balance: 5000,
  //       currency: 'NGN',
  //     });

  //     const response = await request(app)
  //       .get('/api/v1/wallets/balance')
  //       .set('Authorization', `Bearer ${authToken}`)
  //       .expect(200);

  //     expect(response.body.status).toBe('success');
  //     expect(response.body.data.balance).toBe(5000);
  //     expect(response.body.data.currency).toBe('NGN');
  //   });

  //   it('should reject unauthenticated request', async () => {
  //     const response = await request(app)
  //       .get('/api/v1/wallets/balance')
  //       .expect(401);

  //     expect(response.body.code).toBe('UNAUTHORIZED');
  //   });
  // });

  // -----------------------
  // POST /wallets/fund
  // -----------------------
  describe('POST /api/v1/wallets/fund', () => {
    const fundData = { amount: 5000, reference: 'REF123456789' };

    it('should fund wallet successfully', async () => {
      const mockTrx = {
        commit: jest.fn(),
        rollback: jest.fn(),
        where: jest.fn().mockReturnThis(),
        first: jest.fn(),
        forUpdate: jest.fn(),
        update: jest.fn(),
        insert: jest.fn(),
      };

      (mockDb.transaction as jest.Mock).mockResolvedValue(mockTrx);

      // Duplicate check returns null
      mockTrx.first.mockResolvedValueOnce(null);

      // Lock and return wallet
      mockTrx.forUpdate.mockResolvedValueOnce({
        id: 1,
        user_id: 1,
        balance: 1000,
      });

      // Update wallet balance
      mockTrx.update.mockResolvedValueOnce(1);

      // Insert transaction record
      mockTrx.insert.mockResolvedValueOnce([1]);

      // Fetch transaction and wallet data
      (mockDb.where as jest.Mock).mockReturnThis();
      (mockDb.first as jest.Mock)
        .mockResolvedValueOnce({
          id: 1,
          wallet_id: 1,
          type: 'credit',
          amount: 5000,
          reference: fundData.reference,
          created_at: new Date(),
        })
        .mockResolvedValueOnce({
          id: 1,
          user_id: 1,
          balance: 6000,
          currency: 'NGN',
        });

      const response = await request(app)
        .post('/api/v1/wallets/fund')
        .set('Authorization', `Bearer ${authToken}`)
        .send(fundData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.transaction.amount).toBe(5000);
    });

    it('should reject duplicate reference', async () => {
      const mockTrx = {
        commit: jest.fn(),
        rollback: jest.fn(),
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ id: 1 }),
      };

      (mockDb.transaction as jest.Mock).mockResolvedValue(mockTrx);

      const response = await request(app)
        .post('/api/v1/wallets/fund')
        .set('Authorization', `Bearer ${authToken}`)
        .send(fundData)
        .expect(409);

      expect(response.body.code).toBe('DUPLICATE_REFERENCE');
    });

    it('should validate amount is positive', async () => {
      const response = await request(app)
        .post('/api/v1/wallets/fund')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ amount: -100, reference: 'REF123' })
        .expect(400);

      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  // -----------------------
  // POST /wallets/transfer
  // -----------------------
  describe('POST /api/v1/wallets/transfer', () => {
    it('should reject transfer with insufficient funds', async () => {
      const mockTrx = {
        commit: jest.fn(),
        rollback: jest.fn(),
        where: jest.fn().mockReturnThis(),
        first: jest.fn(),
        forUpdate: jest.fn(),
      };

      (mockDb.transaction as jest.Mock).mockResolvedValue(mockTrx);

      // Recipient lookup
      (mockDb.where as jest.Mock).mockReturnThis();
      (mockDb.first as jest.Mock).mockResolvedValueOnce({
        id: 2,
        email: 'recipient@example.com',
      });

      // Sender wallet (low balance)
      mockTrx.forUpdate.mockResolvedValueOnce({
        id: 1,
        user_id: 1,
        balance: 100,
      });

      // Recipient wallet
      mockTrx.forUpdate.mockResolvedValueOnce({
        id: 2,
        user_id: 2,
        balance: 0,
      });

      const response = await request(app)
        .post('/api/v1/wallets/transfer')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ recipientEmail: 'recipient@example.com', amount: 500 })
        .expect(400);

      expect(response.body.code).toBe('INSUFFICIENT_FUNDS');
    });

    it('should reject transfer to non-existent recipient', async () => {
      (mockDb.where as jest.Mock).mockReturnThis();
      (mockDb.first as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/v1/wallets/transfer')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ recipientEmail: 'nonexistent@example.com', amount: 100 })
        .expect(404);

      expect(response.body.code).toBe('NOT_FOUND');
    });
  });

  // -----------------------
  // POST /wallets/withdraw
  // -----------------------
  describe('POST /api/v1/wallets/withdraw', () => {
    it('should validate bank account format', async () => {
      const response = await request(app)
        .post('/api/v1/wallets/withdraw')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ amount: 1000, bankAccount: '12345', bankCode: '058' })
        .expect(400);

      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should validate bank code format', async () => {
      const response = await request(app)
        .post('/api/v1/wallets/withdraw')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ amount: 1000, bankAccount: '0123456789', bankCode: '12' })
        .expect(400);

      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  // -----------------------
  // GET /wallets/transactions
  // -----------------------
  describe('GET /api/v1/wallets/transactions', () => {
    it('should return paginated transaction history', async () => {
      (mockDb.where as jest.Mock).mockReturnThis();
      (mockDb.first as jest.Mock).mockResolvedValueOnce({ id: 1, user_id: 1 });
      (mockDb.orderBy as jest.Mock).mockReturnThis();
      (mockDb.limit as jest.Mock).mockReturnThis();
      (mockDb.offset as jest.Mock).mockResolvedValueOnce([
        { id: 1, type: 'credit', amount: 5000 },
        { id: 2, type: 'debit', amount: 1000 },
      ]);
      (mockDb.count as jest.Mock).mockResolvedValueOnce([{ count: 2 }]);

      const response = await request(app)
        .get('/api/v1/wallets/transactions?page=1&limit=20')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.transactions).toHaveLength(2);
      expect(response.body.data.pagination).toBeDefined();
    });
  });
});
