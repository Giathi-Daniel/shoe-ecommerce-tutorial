## Backend API Flow

```mermaid
graph TD
  A[Client Request] --> B[ExpressJS Server]
  B --> C[Middleware]
  C -->|1. Validate Email - Gmail Only| D1[Email Validator]
  C -->|2. Enforce Strong Password| D2[Password Strength Checker]
  D1 --> E[Route Handler]
  D2 --> E
  E --> F[MongoDB Atlas]
  E --> G[Payment Service - Stripe or PayPal]
  E --> H[Response Sent to Client]
```

