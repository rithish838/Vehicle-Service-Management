const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { timingSafeEqual } = require("crypto");
const { rateLimit } = require("express-rate-limit");
const Customer = require("../models/Customer");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const Service = require("../models/Service");
const Billing = require("../models/Billing");
const { authenticate, getJwtSecret, requireRole } = require("../middleware/auth");

const router = express.Router();
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-7",
    legacyHeaders: false
});

function secureEquals(value, expected) {
    const valueBuffer = Buffer.from(String(value));
    const expectedBuffer = Buffer.from(String(expected));
    return valueBuffer.length === expectedBuffer.length && timingSafeEqual(valueBuffer, expectedBuffer);
}

function signToken(user) {
    const secret = getJwtSecret();
    if (!secret) {
        throw new Error("JWT_SECRET must be at least 32 characters");
    }

    return jwt.sign(
        {
            role: user.role,
            email: user.email,
            customerId: user.customerId,
            tokenVersion: user.tokenVersion || 0
        },
        secret,
        { subject: String(user.id), expiresIn: "8h" }
    );
}

function publicUser(user) {
    return {
        id: String(user.id),
        email: user.email,
        role: user.role,
        customerId: user.customerId ? String(user.customerId) : null
    };
}

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

router.post("/register", authLimiter, async (req, res) => {
    const name = String(req.body.name || "").trim();
    const phone = String(req.body.phone || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const vehicleName = String(req.body.vehicle || "").trim();
    const registration = String(req.body.registration || "").trim().toUpperCase();

    if (name.length < 2 || name.length > 100) {
        return res.status(400).json({ message: "Enter a valid full name" });
    }
    if (phone.length < 5 || phone.length > 30) {
        return res.status(400).json({ message: "Enter a valid phone number" });
    }
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: "Enter a valid email address" });
    }
    if (password.length < 12 || Buffer.byteLength(password, "utf8") > 72) {
        return res.status(400).json({ message: "Use a password between 12 and 72 bytes" });
    }
    if (vehicleName.length < 2 || vehicleName.length > 120) {
        return res.status(400).json({ message: "Enter a valid vehicle make and model" });
    }
    if (registration.length < 3 || registration.length > 30) {
        return res.status(400).json({ message: "Enter a valid registration number" });
    }

    const adminEmail = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    if (email === adminEmail) {
        return res.status(409).json({ message: "This email cannot be used for customer registration" });
    }

    try {
        const emailPattern = new RegExp(`^${escapeRegex(email)}$`, "i");
        const [existingCustomer, existingUser, existingVehicle] = await Promise.all([
            Customer.exists({ email: emailPattern }),
            User.exists({ email }),
            Vehicle.exists({ registration: new RegExp(`^${escapeRegex(registration)}$`, "i") })
        ]);

        if (existingCustomer) {
            return res.status(409).json({
                message: "This email is already on a customer record. Please contact the service team to enable portal access."
            });
        }
        if (existingUser) {
            return res.status(409).json({ message: "An account already exists with this email" });
        }
        if (existingVehicle) {
            return res.status(409).json({ message: "This vehicle is already registered" });
        }

        let customer;
        let user;
        let vehicle;
        try {
            customer = await Customer.create({
                name,
                phone,
                email,
                vehicles: 1,
                status: "Active"
            });
            user = await User.create({
                email,
                passwordHash: await bcrypt.hash(password, 12),
                role: "customer",
                customerId: customer._id
            });
            vehicle = await Vehicle.create({
                vehicle: vehicleName,
                registration,
                owner: customer.name,
                customerId: customer._id,
                lastService: "Not serviced yet",
                status: "Active"
            });

            customer.userId = user._id;
            await customer.save();

            return res.status(201).json({
                token: signToken(user),
                user: publicUser(user),
                message: "Your customer account is ready"
            });
        } catch (error) {
            if (vehicle) await Vehicle.deleteOne({ _id: vehicle._id });
            if (user) await User.deleteOne({ _id: user._id });
            if (customer) await Customer.deleteOne({ _id: customer._id });
            if (error.code === 11000) {
                return res.status(409).json({ message: "An account or vehicle already uses these details" });
            }
            throw error;
        }
    } catch (error) {
        console.error("Customer registration failed:", error);
        return res.status(500).json({ message: "Unable to create customer account" });
    }
});

router.post("/login", authLimiter, async (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const adminEmail = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || "";

    if (!getJwtSecret() || !adminEmail || adminPassword.length < 12) {
        return res.status(503).json({ message: "Admin authentication is not configured" });
    }

    try {
        if (email === adminEmail && secureEquals(password, adminPassword)) {
            const user = { id: "admin", email: adminEmail, role: "admin", customerId: null };
            return res.json({ token: signToken(user), user: publicUser(user) });
        }

        const user = await User.findOne({ email }).select("+passwordHash");
        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            return res.status(401).json({ message: "Email or password is incorrect" });
        }

        return res.json({ token: signToken(user), user: publicUser(user) });
    } catch (error) {
        console.error("Login failed:", error);
        return res.status(500).json({ message: "Unable to sign in" });
    }
});

router.get("/me", authenticate, (req, res) => {
    res.json({
        user: {
            id: req.auth.sub,
            email: req.auth.email,
            role: req.auth.role,
            customerId: req.auth.customerId || null
        }
    });
});

router.post("/customers/:customerId/account", authenticate, requireRole("admin"), async (req, res) => {
    const password = String(req.body.password || "");
    if (password.length < 12 || Buffer.byteLength(password, "utf8") > 72) {
        return res.status(400).json({ message: "Use a password between 12 and 72 bytes" });
    }

    try {
        const customer = await Customer.findById(req.params.customerId);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        const namePattern = new RegExp(`^${escapeRegex(customer.name.trim())}$`, "i");
        const duplicateName = await Customer.exists({
            _id: { $ne: customer._id },
            name: namePattern
        });
        if (duplicateName) {
            return res.status(409).json({ message: "Customer name is not unique; records cannot be linked safely" });
        }

        const email = customer.email.trim().toLowerCase();
        let account = await User.findOne({ email });
        if (account && String(account.customerId) !== String(customer._id)) {
            return res.status(409).json({ message: "That email already belongs to another account" });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        if (account) {
            account.passwordHash = passwordHash;
            account.tokenVersion = Number(account.tokenVersion || 0) + 1;
            await account.save();
        } else {
            account = await User.create({
                email,
                passwordHash,
                role: "customer",
                customerId: customer._id
            });
        }

        customer.userId = account._id;
        await customer.save();

        const unlinked = {
            $or: [
                { customerId: { $exists: false } },
                { customerId: null }
            ]
        };
        await Promise.all([
            Vehicle.updateMany({ owner: namePattern, ...unlinked }, { $set: { customerId: customer._id } }),
            Service.updateMany({ customer: namePattern, ...unlinked }, { $set: { customerId: customer._id } }),
            Billing.updateMany({ customer: namePattern, ...unlinked }, { $set: { customerId: customer._id } })
        ]);

        res.status(200).json({ message: "Customer portal account saved", email, hasAccount: true });
    } catch (error) {
        console.error("Customer account provisioning failed:", error);
        res.status(500).json({ message: "Unable to save customer account" });
    }
});

module.exports = router;
