import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [registration, setRegistration] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await login({ email, password });
      navigate(user.role === "admin" ? "/dashboard" : "/customer-portal", { replace: true });
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      await register({ name, phone, email, password, vehicle, registration });
      navigate("/customer-portal", { replace: true });
    } catch (registrationError) {
      setError(registrationError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp((current) => !current);
    setError("");
  };

  return (
    <div className="login-page">

      <div className="login-left">
        <div className="brand">
          <div className="brand-icon">🚗</div>
          <h1>AutoCare</h1>
        </div>

        <div className="welcome-content">
          <h2>
            Vehicle Service
            <br />
            Management System
          </h2>

          <p>
            Manage customers, vehicles, services and billing
            from one simple platform.
          </p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">

          <h2>{isSignUp ? "Create your account" : "Sign in"}</h2>

          <p className="login-subtitle">
            {isSignUp ? "Set up your customer portal and first vehicle" : "Access your AutoCare account"}
          </p>

          <form onSubmit={isSignUp ? handleSignUp : handleLogin}>

            {isSignUp && (
              <>
                <div className="form-group">
                  <label htmlFor="signup-name">Full name</label>
                  <input
                    id="signup-name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    minLength={2}
                    maxLength={100}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="signup-phone">Phone number</label>
                  <input
                    id="signup-phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    minLength={5}
                    maxLength={30}
                    required
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="login-email">Email address</label>

              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            {isSignUp && (
              <>
                <div className="form-group">
                  <label htmlFor="signup-vehicle">Vehicle make and model</label>
                  <input
                    id="signup-vehicle"
                    type="text"
                    placeholder="Honda City"
                    value={vehicle}
                    onChange={(event) => setVehicle(event.target.value)}
                    minLength={2}
                    maxLength={120}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="signup-registration">Registration number</label>
                  <input
                    id="signup-registration"
                    type="text"
                    autoCapitalize="characters"
                    value={registration}
                    onChange={(event) => setRegistration(event.target.value)}
                    minLength={3}
                    maxLength={30}
                    required
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="login-password">Password</label>

              <input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={isSignUp ? 12 : undefined}
                maxLength={isSignUp ? 72 : undefined}
                required
              />
            </div>

            {isSignUp && (
              <div className="form-group">
                <label htmlFor="signup-confirm-password">Confirm password</label>
                <input
                  id="signup-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  minLength={12}
                  maxLength={72}
                  required
                />
              </div>
            )}

            {error && <p className="login-error" role="alert">{error}</p>}

            <button
              type="submit"
              className="login-button"
              disabled={submitting}
            >
              {submitting ? (isSignUp ? "Creating account..." : "Signing in...") : (isSignUp ? "Create customer account" : "Sign in")}
            </button>

          </form>

          <p className="login-help">
            {isSignUp ? "Have an account already? " : "New customer? "}
            <button className="auth-mode-toggle" type="button" onClick={toggleMode}>
              {isSignUp ? "Sign in" : "Create an account"}
            </button>
          </p>

        </div>
      </div>

    </div>
  );
}

export default Login;