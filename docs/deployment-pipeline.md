## Deployment Pipeline (CI/CD Overview)

```mermaid
graph LR
  A[Local Dev] --> B[Docker Build]
  B --> C[Push to ECR]
  C --> D[Fargate Service Pulls Image]
  D --> E[Backend Deployed]
  F[Frontend Code] --> G[Vercel Git Integration]
  G --> H[Vercel Deploys React App]
  
 Backend is containerized and deployed via ECR and Fargate. Frontend is auto-deployed by Vercel from GitHub commits.
 ```
