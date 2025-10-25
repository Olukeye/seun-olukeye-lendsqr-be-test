import {
  createUserSchema,
  fundWalletSchema,
  transferFundsSchema,
  withdrawFundsSchema,
} from '../validators';

describe('Validators', () => {
  describe('createUserSchema', () => {
    it('should validate correct user data', () => {
      const validData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+2348012345678',
      };

      const { error } = createUserSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+2348012345678',
      };

      const { error } = createUserSchema.validate(invalidData);
      expect(error).toBeDefined();
    });

    it('should reject short first name', () => {
      const invalidData = {
        email: 'test@example.com',
        firstName: 'J',
        lastName: 'Doe',
        phone: '+2348012345678',
      };

      const { error } = createUserSchema.validate(invalidData);
      expect(error).toBeDefined();
    });

    it('should reject invalid phone number', () => {
      const invalidData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: 'invalid',
      };

      const { error } = createUserSchema.validate(invalidData);
      expect(error).toBeDefined();
    });
  });

  describe('fundWalletSchema', () => {
    it('should validate correct fund data', () => {
      const validData = {
        amount: 5000.50,
        reference: 'REF123456',
      };

      const { error } = fundWalletSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject negative amount', () => {
      const invalidData = {
        amount: -100,
        reference: 'REF123456',
      };

      const { error } = fundWalletSchema.validate(invalidData);
      expect(error).toBeDefined();
    });

    it('should reject zero amount', () => {
      const invalidData = {
        amount: 0,
        reference: 'REF123456',
      };

      const { error } = fundWalletSchema.validate(invalidData);
      expect(error).toBeDefined();
    });

    it('should reject short reference', () => {
      const invalidData = {
        amount: 100,
        reference: 'REF',
      };

      const { error } = fundWalletSchema.validate(invalidData);
      expect(error).toBeDefined();
    });
  });

  describe('transferFundsSchema', () => {
    it('should validate correct transfer data', () => {
      const validData = {
        recipientEmail: 'recipient@example.com',
        amount: 1000,
        description: 'Payment for services',
      };

      const { error } = transferFundsSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should accept transfer without description', () => {
      const validData = {
        recipientEmail: 'recipient@example.com',
        amount: 1000,
      };

      const { error } = transferFundsSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject invalid recipient email', () => {
      const invalidData = {
        recipientEmail: 'not-an-email',
        amount: 1000,
      };

      const { error } = transferFundsSchema.validate(invalidData);
      expect(error).toBeDefined();
    });
  });

  describe('withdrawFundsSchema', () => {
    it('should validate correct withdrawal data', () => {
      const validData = {
        amount: 2000,
        bankAccount: '0123456789',
        bankCode: '058',
      };

      const { error } = withdrawFundsSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject invalid bank account length', () => {
      const invalidData = {
        amount: 2000,
        bankAccount: '12345',
        bankCode: '058',
      };

      const { error } = withdrawFundsSchema.validate(invalidData);
      expect(error).toBeDefined();
    });

    it('should reject invalid bank code length', () => {
      const invalidData = {
        amount: 2000,
        bankAccount: '0123456789',
        bankCode: '12',
      };

      const { error } = withdrawFundsSchema.validate(invalidData);
      expect(error).toBeDefined();
    });
  });
});