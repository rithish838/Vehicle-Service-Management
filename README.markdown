# Vehicle Service Management

AutoCare is a vehicle service management app with separate administrator and customer experiences.

## Features

- Role-protected admin dashboard for customers, vehicles, services, mechanics, inventory, billing, and reports.
- Customer sign-up with a first vehicle and a read-only portal for the customer's own records.
- Service requests with preferred date and notes, saved to MongoDB for admin review.
- Booking confirmation email through configurable SMTP.

## Stack

- React and Vite frontend
- Express and Node.js backend
- MongoDB with Mongoose

## Local Setup

Prerequisites: Node.js LTS, MongoDB Community Server, and MongoDB Database Tools if restoring a database dump.

1. Start MongoDB locally at `mongodb://127.0.0.1:27017`.
2. Configure the backend environment:

```powershell
cd backend
Copy-Item .env.example .env
```

Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `JWT_SECRET`, and `MONGODB_URI` in `backend/.env`. Add SMTP settings there if booking emails are needed. Never commit `.env`.

3. In one terminal, start the backend:

```powershell
cd backend
npm install
node server.js
```

4. In another terminal, start the frontend:

```powershell
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173/`.

## Database

The MongoDB database is stored separately from the source folder. To move existing records, export on the original computer:

```powershell
mongodump --uri="mongodb://127.0.0.1:27017/vehicle_service_management" --out="E:\VehicleServiceBackup\db"
```

Restore on the new computer after MongoDB is running:

```powershell
mongorestore --uri="mongodb://127.0.0.1:27017" "E:\VehicleServiceBackup\db\vehicle_service_management"
```

Use MongoDB Compass to view the local database at `mongodb://127.0.0.1:27017`.

## Security

- Keep `backend/.env`, database dumps, and real customer data out of public repositories and shared drives.
- The root `.gitignore` excludes environment files, dependency folders, build output, and database dumps.
- Existing customer records require admin-provisioned portal access; customer self-registration cannot claim an existing profile by email.
