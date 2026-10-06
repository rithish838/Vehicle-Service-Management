# Backend setup

1. Copy `.env.example` to `.env`.
2. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD` (at least 12 characters), and `JWT_SECRET` (at least 32 characters) in `.env`.
3. Make sure MongoDB is running at `MONGODB_URI`.
4. Run `npm install`, then `node server.js`.

Customers can self-register a new portal profile and their first vehicle. Registration cannot claim an existing customer record using only its email; existing records still need an administrator to provision portal access. An administrator can create or reset a customer's portal password from the Customers page. Keep `.env` private and use a unique JWT secret and administrator password outside local development.

To send booking confirmations, set `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM` in `.env`. For Gmail, use `smtp.gmail.com`, port `465` with secure `true` or port `587` with secure `false`, and an App Password rather than your normal account password. Booking requests are still saved if SMTP is unavailable; the customer receives an explicit delivery status in the portal.
