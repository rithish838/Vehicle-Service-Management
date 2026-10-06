const nodemailer = require("nodemailer");

function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
    })[character]);
}

function getTransportConfig() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass || !Number.isInteger(port) || port < 1 || port > 65535) {
        return null;
    }

    return {
        host,
        port,
        secure: process.env.SMTP_SECURE === undefined
            ? port === 465
            : process.env.SMTP_SECURE.toLowerCase() === "true",
        auth: { user, pass }
    };
}

async function sendBookingConfirmation({ customer, vehicle, request }) {
    const transportConfig = getTransportConfig();
    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
    if (!transportConfig || !fromEmail) {
        return { sent: false, reason: "not_configured" };
    }

    const fromName = process.env.SMTP_FROM_NAME || "AutoCare Service Center";
    const safeName = escapeHtml(customer.name);
    const safeServiceId = escapeHtml(request.serviceId);
    const safeVehicle = escapeHtml(`${vehicle.vehicle} (${vehicle.registration})`);
    const safeServiceType = escapeHtml(request.serviceType);
    const safePreferredDate = escapeHtml(request.preferredDate || "No preferred date requested");
    const safeNotes = escapeHtml(request.notes || "No additional notes");
    const transporter = nodemailer.createTransport(transportConfig);

    await transporter.sendMail({
        from: { name: fromName, address: fromEmail },
        to: customer.email,
        subject: `Service booking confirmation - ${request.serviceId}`,
        text: [
            `Hello ${customer.name},`,
            "",
            "We received your service request.",
            `Request: ${request.serviceId}`,
            `Vehicle: ${vehicle.vehicle} (${vehicle.registration})`,
            `Service: ${request.serviceType}`,
            `Preferred date: ${request.preferredDate || "No preferred date requested"}`,
            `Notes: ${request.notes || "No additional notes"}`,
            "Status: Pending confirmation by our service team.",
            "",
            "AutoCare Service Center"
        ].join("\n"),
        html: `<div style="font-family:Arial,sans-serif;color:#1b2c2a;line-height:1.6;max-width:600px;margin:auto"><h2 style="color:#16745e">Service request received</h2><p>Hello ${safeName},</p><p>We have received your service request. Our service team will confirm the appointment details.</p><table style="border-collapse:collapse;width:100%"><tr><td style="padding:8px;border-bottom:1px solid #e2e9e5"><strong>Request</strong></td><td style="padding:8px;border-bottom:1px solid #e2e9e5">${safeServiceId}</td></tr><tr><td style="padding:8px;border-bottom:1px solid #e2e9e5"><strong>Vehicle</strong></td><td style="padding:8px;border-bottom:1px solid #e2e9e5">${safeVehicle}</td></tr><tr><td style="padding:8px;border-bottom:1px solid #e2e9e5"><strong>Service</strong></td><td style="padding:8px;border-bottom:1px solid #e2e9e5">${safeServiceType}</td></tr><tr><td style="padding:8px;border-bottom:1px solid #e2e9e5"><strong>Preferred date</strong></td><td style="padding:8px;border-bottom:1px solid #e2e9e5">${safePreferredDate}</td></tr><tr><td style="padding:8px;border-bottom:1px solid #e2e9e5"><strong>Notes</strong></td><td style="padding:8px;border-bottom:1px solid #e2e9e5">${safeNotes}</td></tr><tr><td style="padding:8px"><strong>Status</strong></td><td style="padding:8px">Pending</td></tr></table><p>AutoCare Service Center</p></div>`
    });

    return { sent: true };
}

module.exports = { getTransportConfig, sendBookingConfirmation };
