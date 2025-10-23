export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_blacklisted: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Wallet {
  id: number;
  user_id: number;
  balance: number;
  currency: string;
  created_at: Date;
  updated_at: Date;
}

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
  TRANSFER = 'transfer',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface Transaction {
  id: number;
  wallet_id: number;
  type: TransactionType;
  amount: number;
  reference: string;
  description: string | null;
  recipient_wallet_id: number | null;
  status: TransactionStatus;
  metadata: Record<string, any> | null;
  created_at: Date;
}

export interface CreateUserDTO {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface FundWalletDTO {
  amount: number;
  reference: string;
}

export interface TransferFundsDTO {
  recipientEmail: string;
  amount: number;
  description?: string;
}

export interface WithdrawFundsDTO {
  amount: number;
  bankAccount: string;
  bankCode: string;
}

export interface JWTPayload {
  userId: number;
  email: string;
}