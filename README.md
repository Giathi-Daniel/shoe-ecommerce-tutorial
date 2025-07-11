# Shoe E-Commerce Website — Fullstack Project

This is a very simple but complete **eCommerce tutorial project** for learning fullstack development and cloud deployment.

---

## Tech Stack

| Layer      | Stack                          |
|------------|-------------------------------|
| Frontend   | React, Tailwind CSS (Vercel)   |
| Backend    | Node.js, Express (AWS Fargate) |
| Database   | MongoDB Atlas                  |
| Payments   | Stripe / PayPal (for demo)     |
| Container  | Docker                         |
| Registry   | Amazon ECR                     |
| Deployment | AWS Fargate (serverless)       |

---

## 🗂️ Folder Structure

- `backend/`: Node.js app with APIs for auth, products, cart, and payment
- `frontend/`: React + Tailwind app deployed on Vercel
- `docs/`: Design diagrams and planning files

---

## Project Features

- Product list with filters
- Add to Cart
- User login/signup
- Payment (Stripe/PayPal demo)
- Fully deployed & shareable

---

## Security

- Environment variable configs
- Basic validation and sanitization
- JWT Auth
- Helmet.js, cors, rate limiters

---

## Deployment Plan

1. Build & Dockerize backend
2. Push to Amazon ECR
3. Deploy to AWS Fargate
4. MongoDB Atlas connection
5. Frontend deployed via Vercel

---

## Learning Goals

This project was built to help beginners learn:
- Fullstack web app development
- Modern deployment with Docker & AWS
- Secure coding practices
- Payment integration basics

---

## Disclaimer

The Stripe & PayPal logic is for educational purposes only. It is **disabled in production** to avoid charges.

---
