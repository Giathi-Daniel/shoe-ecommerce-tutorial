## Frontend Logic Flow

```mermaid
graph TD
  A[Homepage - Products] --> B[Product Filters]
  B --> C[Product Card Component]
  C --> D[Add to Cart]
  D --> E[Cart Page]
  E --> F[Login or Sign-Up]
  F -->|1. Gmail-only Email Field| G1[Frontend Validation]
  F -->|2. Strong Password Check| G2[Password Validator]
  G1 --> H[API Call - /api/auth]
  G2 --> H
  H --> I[JWT Token and Redirect to Checkout]
  I --> J[Checkout Page]
```
The frontend uses reusable components, enforces password and email validation (blocking weak passwords and non-Gmail addresses), and implements conditional routing based on login status and cart state before calling the backend authentication API.
