import { Link } from "react-router-dom";

function BackToDashboard() {
  return (
    <Link to="/dashboard" className="back-button">
      ← Back to Dashboard
    </Link>
  );
}

export default BackToDashboard;