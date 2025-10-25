import { Router } from 'express';
import walletController from '../controllers/wallet.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validator.middleware';
import {
  fundWalletSchema,
  transferFundsSchema,
  withdrawFundsSchema,
} from '../utils/validators';

const router = Router();

// All wallet routes require authentication
router.use(authenticate);

// router.get('/balance', walletController.getBalance);
router.post('/fund', validate(fundWalletSchema), walletController.fundWallet);
router.post('/transfer', validate(transferFundsSchema), walletController.transferFunds);
// router.post('/withdraw', validate(withdrawFundsSchema), walletController.withdrawFunds);
// router.get('/transactions', walletController.getTransactionHistory);

module.exports = router;