import request from 'supertest';
import app from '../../app';
import db from '../../config/database';
import adjutorService from '../../services/adjutor.service';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../../services/adjutor.service', () => ({
  __esModule: true,
  default: {
    checkBlacklist: jest.fn(),
  },
}));

describe('User Routes', () => {
  const mockDb = db as jest.MockedFunction<typeof db>;
  const mockAdjutorService = adjutorService as jest.Mocked<typeof adjutorService>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/users/register', () => {
    const validUserData = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+2348012345678',
    };

    it('should register a new user successfully', async () => {
      mockAdjutorService.checkBlacklist.mockResolvedValue(false);

      mockDb
        .mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          first: jest.fn().mockResolvedValue(null),
        } as any)
        .mockReturnValueOnce({
          insert: jest.fn().mockResolvedValue([1]),
        } as any)
        .mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          first: jest.fn().mockResolvedValue({
            id: 1,
            email: validUserData.email,
            first_name: validUserData.firstName,
            last_name: validUserData.lastName,
            phone: validUserData.phone,
          }),
        } as any)
        .mockReturnValueOnce({
          insert: jest.fn().mockResolvedValue([1]),
        } as any)
        .mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          first: jest.fn().mockResolvedValue({
            id: 1,
            user_id: 1,
            balance: 0,
            currency: 'NGN',
          }),
        } as any);

      const response = await request(app)
        .post('/api/v1/users/register')
        .send(validUserData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user.email).toBe(validUserData.email);
      expect(response.body.data.wallet).toBeDefined();
      expect(response.body.data.token).toBeDefined();
    });

    it('should reject blacklisted user', async () => {
      mockAdjutorService.checkBlacklist.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/v1/users/register')
        .send(validUserData)
        .expect(403);

      expect(response.body.status).toBe('error');
      expect(response.body.code).toBe('BLACKLISTED_USER');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/users/register')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should reject duplicate email', async () => {
      mockAdjutorService.checkBlacklist.mockResolvedValue(false);

      mockDb.mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ id: 1, email: validUserData.email }),
      } as any);

      const response = await request(app)
        .post('/api/v1/users/register')
        .send(validUserData)
        .expect(409);

      expect(response.body.status).toBe('error');
      expect(response.body.code).toBe('CONFLICT');
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/v1/users/register')
        .send({
          ...validUserData,
          email: 'not-an-email',
        })
        .expect(400);

      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should validate phone number format', async () => {
      const response = await request(app)
        .post('/api/v1/users/register')
        .send({
          ...validUserData,
          phone: 'invalid-phone',
        })
        .expect(400);

      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });
});
