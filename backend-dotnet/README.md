# KinekatyApi — .NET Backend

ASP.NET Core Web API (.NET 10) · Entity Framework Core · PostgreSQL via Supabase

---

## Stack

| Layer | Service |
|---|---|
| Frontend | Vercel (React) |
| Node.js API | Render (kinekaty.onrender.com) |
| .NET API | Render (this project) |
| Database | Supabase (PostgreSQL) |

> Vercel cannot host .NET. The .NET backend is deployed on Render.

---

## 1. Supabase setup

1. Go to https://supabase.com -> New project
2. After creation: Settings -> Database -> Connection string (URI)
3. Copy the URI, it looks like:
   postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres

---

## 2. Local development (no Docker needed)

### Node.js backend
  cd backend
  cp .env.example .env        # fill in your Supabase DATABASE_URL + secrets
  npm install
  npx prisma migrate deploy
  npm run dev                 # http://localhost:4000

### .NET backend
Open frontend/backend-dotnet/appsettings.Development.json and fill in:
- db.YOUR_PROJECT_REF.supabase.co  ->  from Supabase connection string
- YOUR_DB_PASSWORD                 ->  your Supabase password
- REPLACE_WITH_LONG_RANDOM_SECRET  ->  any 32+ char random string

Then run:
  cd frontend/backend-dotnet
  dotnet run    # http://localhost:5142  |  Swagger: http://localhost:5142/swagger

### React frontend
  cd frontend
  cp .env.example .env        # REACT_APP_API_URL=http://localhost:4000
  npm install
  npm start                   # http://localhost:3000

---

## 3. Deploy .NET backend to Render

1. Push repo to GitHub
2. render.com -> New -> Web Service
3. Connect repo, Root Directory = frontend/backend-dotnet
4. Runtime = Docker   |   Port = 10000
5. Set these Environment Variables on Render:

   ConnectionStrings__DefaultConnection  =  Host=db.PROJECT_REF.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=PASSWORD;SSL Mode=Require;Trust Server Certificate=true
   Jwt__Key                              =  your long random secret
   Jwt__Issuer                           =  KinekatyApi
   Jwt__Audience                         =  KinekatyApi
   Frontend__Url                         =  https://YOUR_APP.vercel.app
   ASPNETCORE_ENVIRONMENT                =  Production

6. Deploy

---

## 4. Deploy Node.js backend to Render

Set on Render:
  DATABASE_URL          = postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres?sslmode=require
  JWT_SECRET            = your secret
  FRONTEND_URL          = https://YOUR_APP.vercel.app
  STRIPE_SECRET_KEY     = sk_...
  STRIPE_WEBHOOK_SECRET = whsec_...

---

## 5. Deploy frontend to Vercel

Set in Vercel dashboard:
  REACT_APP_API_URL = https://kinekaty.onrender.com

---

## API Endpoints

POST   /api/auth/register          public
POST   /api/auth/login             public
GET    /api/auth                   admin only
GET    /api/classes                public
POST   /api/classes                admin only
PUT    /api/classes/{id}           admin only
DELETE /api/classes/{id}           admin only
POST   /api/bookings               auth
GET    /api/bookings/me            auth
GET    /api/bookings/all           admin only
POST   /api/tokens/buy             auth
POST   /api/tokens/use             auth
GET    /api/tokens/me              auth
GET    /api/tokens/all             admin only
POST   /api/payment/createsession  auth
GET    /api/health                 public

---

## Seed accounts (auto-created on first startup)

admin@studio.local  /  adminpass  (Admin)
client@example.com  /  userpass   (Client)
