# Project Handoff

This note summarizes the project work and machine-transfer steps. It intentionally excludes passwords and mail secrets.

## Current App

- Frontend: React/Vite in `frontend`; local URL is `http://127.0.0.1:5173/`.
- Backend: Express in `backend`; local API is `http://127.0.0.1:5000/`.
- Database: local MongoDB database `vehicle_service_management` at `mongodb://127.0.0.1:27017`.
- MongoDB Compass is a viewer; the database itself is stored separately from this project folder.

## Roles

- Admin signs in using credentials configured in the private `backend/.env` file and manages records.
- Customers can create a new account with a first vehicle. Registration refuses emails already present on customer records so existing records cannot be claimed without an admin.
- Customer API access is read-only and scoped to the authenticated customer's linked records.
- Admin creates portal access for existing customer records from the Customers page.

## Service Requests and Email

- Customer bookings are saved as pending service requests in MongoDB's `Services` collection with a generated request ID, vehicle, service type, preferred date, and notes.
- Admin reviews requests under Services and assigns a mechanic or changes status.
- Gmail SMTP is configured through `backend/.env`. New booking confirmations are sent to the email on the customer's account. Admin status changes do not currently send follow-up emails.
- Local MongoDB contains service-request data that is not included in the project folder; export and transfer it separately when needed.

## Running Locally

In separate terminals:

```powershell
cd backend
npm install
node server.js
```

```powershell
cd frontend
npm install
npm run dev
```

Keep `backend/.env` private. It contains admin, JWT, and SMTP secrets. No secrets belong in chat, source control, or an unsecured drive.

## Moving to Another PC

1. Copy the project folder. `node_modules` can be excluded and reinstalled with `npm install` in both `backend` and `frontend`.
2. On the laptop, export MongoDB data:

```powershell
mongodump --uri="mongodb://127.0.0.1:27017/vehicle_service_management" --out="E:\VehicleServiceBackup\db"
```

3. On the PC, install MongoDB Community Server and MongoDB Database Tools, then restore:

```powershell
mongorestore --uri="mongodb://127.0.0.1:27017" "E:\VehicleServiceBackup\db\vehicle_service_management"
```

4. Copy `backend/.env` securely or configure new secrets on the PC. Ensure `MONGODB_URI` points to that PC's local database. Then start both servers as shown above.
5. In MongoDB Compass, connect to `mongodb://127.0.0.1:27017` and open `vehicle_service_management`.

## Checks Previously Run

Frontend lint and production build passed. Browser checks exercised admin/customer sign-in, customer/admin access separation, signup, booking, and admin visibility of a submitted booking. SMTP authentication was verified without sending a test message.
