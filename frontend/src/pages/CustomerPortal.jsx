import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import { useAuth } from "../context/useAuth";

function CustomerPortal() {
  const { logout, user } = useAuth();
  const [portal, setPortal] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [bookingVehicleId, setBookingVehicleId] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [notes, setNotes] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [booking, setBooking] = useState(false);

  const localToday = new Date();
  localToday.setMinutes(localToday.getMinutes() - localToday.getTimezoneOffset());
  const minimumDate = localToday.toISOString().slice(0, 10);

  useEffect(() => {
    let active = true;

    apiFetch("/api/customer-portal")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to load your account");
        return data;
      })
      .then((data) => {
        if (active) {
          setPortal(data);
          setBookingVehicleId(data.vehicles[0]?._id || "");
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleBookingSubmit = async (event) => {
    event.preventDefault();
    setBookingError("");
    setBookingSuccess("");
    setBooking(true);

    try {
      const response = await apiFetch("/api/customer-portal/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId: bookingVehicleId, serviceType, preferredDate, notes })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to book this service");

      setBookingSuccess(`${data.request.serviceId}: ${data.message}`);
      setServiceType("");
      setPreferredDate("");
      setNotes("");

      const portalResponse = await apiFetch("/api/customer-portal");
      if (portalResponse.ok) setPortal(await portalResponse.json());
    } catch (bookingRequestError) {
      setBookingError(bookingRequestError.message);
    } finally {
      setBooking(false);
    }
  };

  return (
    <main className="customer-portal">
      <header className="portal-header">
        <div className="portal-brand">
          <span className="portal-brand-icon">A</span>
          <div>
            <strong>AutoCare</strong>
            <span>Customer portal</span>
          </div>
        </div>
        <div className="portal-account">
          <div>
            <strong>{portal?.customer.name || user.email}</strong>
            <span>Customer account</span>
          </div>
          <button className="portal-logout" onClick={logout} type="button">
            Sign out
          </button>
        </div>
      </header>

      <div className="portal-content">
        <div className="portal-title">
          <div>
            <p className="portal-eyebrow">YOUR ACCOUNT</p>
            <h1>Service overview</h1>
            <p>View your vehicles, service progress, and invoices.</p>
          </div>
        </div>

        {loading && <p className="portal-message">Loading your account...</p>}
        {error && <p className="portal-message portal-error" role="alert">{error}</p>}

        {portal && (
          <>
            <section className="portal-profile" aria-label="Customer details">
              <div><span>Name</span><strong>{portal.customer.name}</strong></div>
              <div><span>Email</span><strong>{portal.customer.email}</strong></div>
              <div><span>Phone</span><strong>{portal.customer.phone}</strong></div>
              <div><span>Account status</span><strong>{portal.customer.status}</strong></div>
            </section>

            <section className="portal-section booking-section">
              <div className="portal-section-heading">
                <div>
                  <p className="portal-eyebrow">SERVICE REQUEST</p>
                  <h2>Book a service</h2>
                </div>
              </div>
              {portal.vehicles.length ? (
                <form className="booking-form" onSubmit={handleBookingSubmit}>
                  <label>
                    Vehicle
                    <select
                      value={bookingVehicleId}
                      onChange={(event) => setBookingVehicleId(event.target.value)}
                      required
                    >
                      <option value="">Select your vehicle</option>
                      {portal.vehicles.map((vehicle) => (
                        <option key={vehicle._id} value={vehicle._id}>
                          {vehicle.vehicle} · {vehicle.registration}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Service type
                    <select
                      value={serviceType}
                      onChange={(event) => setServiceType(event.target.value)}
                      required
                    >
                      <option value="">Choose a service</option>
                      <option>General inspection</option>
                      <option>Oil and filter change</option>
                      <option>Brake inspection</option>
                      <option>AC service</option>
                      <option>Tyre service</option>
                      <option>Engine diagnostics</option>
                      <option>Other</option>
                    </select>
                  </label>
                  <label>
                    Preferred date
                    <input
                      type="date"
                      min={minimumDate}
                      value={preferredDate}
                      onChange={(event) => setPreferredDate(event.target.value)}
                    />
                  </label>
                  <label className="booking-notes">
                    Notes for the service team
                    <textarea
                      maxLength={1000}
                      rows={3}
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder="Describe the issue or anything the team should know"
                    />
                  </label>
                  <div className="booking-actions">
                    {bookingError && <p className="login-error" role="alert">{bookingError}</p>}
                    {bookingSuccess && <p className="booking-success" role="status">{bookingSuccess}</p>}
                    <button className="primary-button" type="submit" disabled={booking}>
                      {booking ? "Sending request..." : "Send service request"}
                    </button>
                  </div>
                </form>
              ) : (
                <p className="portal-empty">A vehicle must be linked to your account before you can book a service.</p>
              )}
            </section>

            <section className="portal-section">
              <div className="portal-section-heading">
                <h2>My vehicles</h2>
                <span>{portal.vehicles.length}</span>
              </div>
              {portal.vehicles.length ? (
                <div className="portal-table-wrap">
                  <table className="portal-table">
                    <thead><tr><th>Vehicle</th><th>Registration</th><th>Last service</th><th>Status</th></tr></thead>
                    <tbody>{portal.vehicles.map((vehicle) => (
                      <tr key={vehicle._id}>
                        <td>{vehicle.vehicle}</td><td>{vehicle.registration}</td><td>{vehicle.lastService}</td><td>{vehicle.status}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              ) : <p className="portal-empty">No vehicles are linked to your account yet.</p>}
            </section>

            <section className="portal-section">
              <div className="portal-section-heading">
                <h2>Service history</h2>
                <span>{portal.services.length}</span>
              </div>
              {portal.services.length ? (
                <div className="portal-table-wrap">
                  <table className="portal-table">
                    <thead><tr><th>Service ID</th><th>Vehicle</th><th>Service</th><th>Preferred date</th><th>Status</th></tr></thead>
                    <tbody>{portal.services.map((service) => (
                      <tr key={service._id}>
                        <td>{service.serviceId}</td><td>{service.vehicle}</td><td>{service.serviceType}</td><td>{service.preferredDate || "Not set"}</td><td>{service.status}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              ) : <p className="portal-empty">No service history is available yet.</p>}
            </section>

            <section className="portal-section">
              <div className="portal-section-heading">
                <h2>Invoices</h2>
                <span>{portal.invoices.length}</span>
              </div>
              {portal.invoices.length ? (
                <div className="portal-table-wrap">
                  <table className="portal-table">
                    <thead><tr><th>Invoice</th><th>Vehicle</th><th>Amount</th><th>Status</th></tr></thead>
                    <tbody>{portal.invoices.map((invoice) => (
                      <tr key={invoice._id}>
                        <td>{invoice.invoiceId}</td><td>{invoice.vehicle}</td><td>₹{Number(invoice.amount).toLocaleString("en-IN")}</td><td>{invoice.status}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              ) : <p className="portal-empty">No invoices are available yet.</p>}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default CustomerPortal;
