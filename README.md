# GhanaTrust

GhanaTrust — Building a trusted digital marketplace for Ghana's local service economy.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MySQL (via XAMPP), Prisma ORM
- **Authentication**: JWT
- **Real-time**: Socket.io
- **Email**: Nodemailer

## Architecture

```
React JSX
     │
     │ HTTP / REST API
     ▼
Node.js + Express
     │
     │ Prisma
     ▼
MySQL
     │
     ▼
XAMPP / MySQL Server
```

## Getting Started

### Prerequisites

- Node.js >= 18
- XAMPP with MySQL running
- npm or yarn

### Installation

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Database Setup

```bash
cd server
npx prisma db push
npm run prisma:seed
```

### Environment Configuration

Create a `.env` file in the `server` directory:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
JWT_EXPIRE=7d
DATABASE_URL="mysql://root:@localhost:3306/ghanatrust"
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=ghanatrust
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=test@ethereal.email
EMAIL_PASS=test
EMAIL_FROM=GhanaTrust <no-reply@ghanatrust.com>
```

### Running the Application

```bash
# Terminal 1 - Start backend
cd server
npm run dev

# Terminal 2 - Start frontend
cd client
npm run dev
```

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ghanatrust.com | Password123! |
| Provider | kwame@ghanatrust.com | Password123! |
| Customer | customer@ghanatrust.com | Password123! |

## Features

- User registration and authentication (JWT)
- Role-based access (Customer, Provider, Admin)
- Service categories and provider profiles
- Provider verification system (Identity, Skills, Location)
- Booking workflow with status tracking
- Reviews and ratings
- Payment records (Mobile Money)
- Dispute resolution
- Admin dashboard for verification management

## Development Phases

- **Phase 1**: Foundation (React, Node/Express, MySQL, Auth)
- **Phase 2**: Service discovery (Categories, Services, Locations, Search)
- **Phase 3**: Verification (Identity, Skills, Admin dashboard)
- **Phase 4**: Booking (Requests, Status, Completion)
- **Phase 5**: Reputation (Reviews, Ratings, Trust scores)
- **Phase 6**: Payments (Mobile Money, Transaction history)
- **Phase 7**: Disputes (Complaints, Evidence, Resolution)
- **Phase 8**: Advanced features (Real-time messaging, Maps, AI matching)

## License

MIT
