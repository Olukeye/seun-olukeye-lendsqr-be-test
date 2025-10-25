# Demo Credit Wallet API

A robust MVP wallet service built with NodeJS, TypeScript, MySQL, and KnexJS for managing user accounts, funds, and peer-to-peer transactions.

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [Database Design](#database-design)
- [API Documentation](#api-documentation)
- [Setup Instructions](#setup-instructions)
- [Testing](#testing)
- [Deployment](#deployment)

## Architecture Overview

### Technology Stack
- **Runtime**: Node.js (LTS v20.x)
- **Language**: TypeScript
- **Database**: MySQL 8.0
- **ORM**: KnexJS
- **Testing**: Jest
- **Validation**: Joi
- **External API**: Lendsqr Adjutor Karma

### Design Principles
1. **Layered Architecture**: Separation of concerns with Controllers, Services, and Data Access layers
2. **SOLID Principles**: Single responsibility, dependency injection
3. **Transaction Safety**: All financial operations wrapped in database transactions
4. **Idempotency**: Transaction references prevent duplicate operations
5. **Audit Trail**: Complete logging of all wallet activities

### Project Structure
```
src/
├── config/          # Configuration files (database, environment)
├── controllers/     # Request handlers
├── services/        # Business logic layer
├── models/          # Database models and types
├── middleware/      # Authentication, validation, error handling
├── utils/           # Helper functions
├── routes/          # API route definitions
├── database/
│   ├── migrations/  # Database schema migrations
│   └── seeds/       # Test data seeds
└── tests/           # Unit and integration tests
```

## Database Design

### Entity-Relationship Diagram

```
┌─────────────────┐         ┌──────────────────┐
│     Users       │         │    Wallets       │
├─────────────────┤         ├──────────────────┤
│ id (PK)         │────────<│ id (PK)          │
│ email           │    1:1  │ user_id (FK)     │
│ first_name      │         │ balance          │
│ last_name       │         │ currency         │
│ phone           │         │ created_at       │
│ is_blacklisted  │         │ updated_at       │
│ created_at      │         └──────────────────┘
│ updated_at      │                 │
└─────────────────┘                 │ 1:M
                                    │
                          ┌─────────▼──────────┐
                          │   Transactions     │
                          ├────────────────────┤
                          │ id (PK)            │
                          │ wallet_id (FK)     │
                          │ type               │
                          │ amount             │
                          │ reference          │
                          │ description        │
                          │ recipient_wallet   │
                          │ status             │
                          │ metadata           │
                          │ created_at         │
                          └────────────────────┘
```

### Indexes
- `users.email` - UNIQUE index
- `transactions.reference` - UNIQUE index for idempotency
- `transactions.wallet_id` - For transaction history queries
- `wallets.user_id` - UNIQUE index for one-to-one relationship

## API Documentation

### Base URL
```
https://<your-name>-lendsqr-be-test.herokuapp.com/api/v1
```

### Authentication
All endpoints (except user creation) require a Bearer token:
```
Authorization: Bearer <token>
```

### Endpoints

#### 1. Create User Account
```http
POST api/v1//users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+2348012345678"
}

Response: 201 Created
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "wallet": {
      "id": 1,
      "balance": "0.00",
      "currency": "NGN"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}

POST/api/v1/users/login
Content-Type: application/json
{
  "email": "user@example.com",
}
Response: 200 OK
{
  "status": "success",
  "data": {
    "user": {
      "id": 27,
      "email": "lade@gmail.com",
      "firstName": "lade",
      "lastName": "lade",
      "phone": "+88888888888888"
    },
    "wallet": {
      "id": 24,
      "balance": "500.00",
      "currency": "NGN",
      "account_no": "2205344191"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjI3LCJlbWFpbCI6ImxhZGVAZ21haWwuY29tIiwiaWF0IjoxNzYxMzkxODAxLCJleHAiOjE3NjE5OTY2MDF9.VbBhMOKz44CP1CerR-SOZuIhVKuluZ7UJjDZ0ovE_I4"
  }
}
```

#### 2. Fund Account
```http
POST /wallets/fund
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 5000.00,
  "reference": "REF123456789"
}

Response: 200 OK
{
  "status": "success",
  "data": {
    "transaction": {
      "id": 1,
      "amount": "5000.00",
      "balance": "5000.00",
      "reference": "REF123456789",
      "createdAt": "2025-10-23T10:30:00Z"
    }
  }
}
```

#### 3. Transfer Funds
```http
POST /wallets/transfer
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipientEmail": "recipient@example.com",
  "amount": 1000.00,
  "description": "Payment for services"
}

Response: 200 OK
{
  "status": "success",
  "data": {
    "transaction": {
      "id": 2,
      "amount": "1000.00",
      "balance": "4000.00",
      "recipient": "recipient@example.com",
      "reference": "TXN1634982600000",
      "createdAt": "2025-10-23T10:35:00Z"
    }
  }
}
```

#### 4. Withdraw Funds
```http
POST /wallets/withdraw
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 2000.00,
  "bankAccount": "0123456789",
  "bankCode": "058"
}

Response: 200 OK
{
  "status": "success",
  "data": {
    "transaction": {
      "id": 3,
      "amount": "2000.00",
      "balance": "2000.00",
      "reference": "WTH1634982700000",
      "createdAt": "2025-10-23T10:40:00Z"
    }
  }
}
```

#### 5. Get Wallet Balance
Response: 200 OK
{
  "status": "success",
  "data": {
    "balance": "2000.00",
    "currency": "NGN"
  }
}
```

#### 6. Get Transaction History
```http
GET /wallets/transactions
Authorization: Bearer <token>

Response: 200 OK
{
  "status": "success",
  "data": {
    "transactions": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45
    }
  }
}
```

### Error Responses

```json
{
  "status": "error",
  "message": "Insufficient funds",
  "code": "INSUFFICIENT_FUNDS"
}
```

Common error codes:
- `BLACKLISTED_USER` - User is on Karma blacklist
- `INSUFFICIENT_FUNDS` - Wallet balance too low
- `INVALID_RECIPIENT` - Recipient not found
- `DUPLICATE_REFERENCE` - Transaction already processed
- `VALIDATION_ERROR` - Invalid request data

## Setup Instructions

### Prerequisites
- Node.js v20.x or higher
- MySQL 8.0
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone
cd demo-credit-wallet
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env`:
```env
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=demo_credit

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Adjutor Karma API
ADJUTOR_API_URL=https://adjutor.lendsqr.com/v2
ADJUTOR_API_KEY=your-api-key
```

4. Run database migrations
```bash
npm run migrate
```

5. (Optional) Seed test data
```bash
npm run seed
```

6. Start the development server
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## Testing

### Run All Tests
```bash
npm test
```

### Test Structure
```
tests/
├── unit/
│   ├── services/
│   │   ├── user.service.test.ts
│   │   ├── wallet.service.test.ts
│   │   └── transaction.service.test.ts
│   └── utils/
│       └── validators.test.ts
└── integration/
    ├── user.routes.test.ts
    ├── wallet.routes.test.ts
    └── transaction.routes.test.ts
```

### Test Coverage Requirements
- Minimum 80% code coverage
- Positive and negative test scenarios
- Edge cases (concurrent transactions, race conditions)

## Implementation Decisions

### 1. Transaction Safety
**Decision**: All financial operations use database transactions with row-level locking.

**Rationale**: Prevents race conditions in concurrent transfers. `SELECT ... FOR UPDATE` ensures balance checks and updates are atomic.

### 2. Idempotency Keys
**Decision**: Unique reference required for funding operations.

**Rationale**: Prevents duplicate charges if a request is retried due to network issues.

### 3. Soft Balance Checks
**Decision**: Balance validation happens within the transaction scope, not before.

**Rationale**: Eliminates TOCTOU (Time-of-Check-Time-of-Use) vulnerabilities.

### 4. Adjutor Integration
**Decision**: Blacklist check happens synchronously during registration.

**Rationale**: Per requirements, blacklisted users should never be onboarded.

### 5. Token-Based Authentication
**Decision**: Simple JWT with user ID payload.

## Security Considerations

1. **Input Validation**: All inputs validated with Joi schemas
2. **SQL Injection**: Parameterized queries via KnexJS
4. **Amount Validation**: Only positive values accepted
5. **Error Messages**: Generic messages to prevent information leakage


## Known Limitations

1. Single currency support (NGN only)
2. No withdrawal bank integration (mock implementation)
3. Simplified authentication
4. No email notifications
5. No transaction reversal mechanism
