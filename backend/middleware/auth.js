const jwt = require("jsonwebtoken");
const User = require("../models/User");

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    return secret && secret.length >= 32 ? secret : null;
}

async function authenticate(req, res, next) {
    const secret = getJwtSecret();
    if (!secret) {
        return res.status(503).json({ message: "Authentication is not configured" });
    }

    const authorization = req.get("authorization") || "";
    const [scheme, token] = authorization.split(" ");
    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ message: "Authentication required" });
    }

    try {
        const payload = jwt.verify(token, secret);
        if (payload.role === "customer") {
            const user = await User.findById(payload.sub).select("role customerId tokenVersion");
            if (
                !user ||
                user.role !== "customer" ||
                String(user.customerId) !== String(payload.customerId) ||
                Number(user.tokenVersion || 0) !== Number(payload.tokenVersion || 0)
            ) {
                return res.status(401).json({ message: "Invalid or expired session" });
            }
        }

        req.auth = payload;
        return next();
    } catch {
        return res.status(401).json({ message: "Invalid or expired session" });
    }
}

function requireRole(role) {
    return (req, res, next) => {
        if (req.auth?.role !== role) {
            return res.status(403).json({ message: "Access denied" });
        }
        next();
    };
}

module.exports = { authenticate, getJwtSecret, requireRole };
