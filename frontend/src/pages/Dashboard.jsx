import { NavLink } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function Dashboard() {
  const { logout, user } = useAuth();

  return (
    <div className="dashboard">

      {/* Sidebar */}
      <aside className="sidebar">

        <div className="sidebar-brand">
          <div className="brand-icon">🚗</div>
          <div>
            <h2>AutoCare</h2>
            <span>Service Management</span>
          </div>
        </div>
<nav className="sidebar-nav">

  <NavLink
    to="/dashboard"
    className={({ isActive }) =>
      isActive ? "nav-item active" : "nav-item"
    }
  >
    <span>▣</span>
    Dashboard
  </NavLink>

  <NavLink
    to="/customers"
    className={({ isActive }) =>
      isActive ? "nav-item active" : "nav-item"
    }
  >
    <span>👥</span>
    Customers
  </NavLink>

  <NavLink
    to="/vehicles"
    className={({ isActive }) =>
      isActive ? "nav-item active" : "nav-item"
    }
  >
    <span>🚘</span>
    Vehicles
  </NavLink>

  <NavLink
    to="/services"
    className={({ isActive }) =>
      isActive ? "nav-item active" : "nav-item"
    }
  >
    <span>🔧</span>
    Services
  </NavLink>

  <NavLink
    to="/mechanics"
    className={({ isActive }) =>
      isActive ? "nav-item active" : "nav-item"
    }
  >
    <span>👨‍🔧</span>
    Mechanics
  </NavLink>

  <NavLink
    to="/spare-parts"
    className={({ isActive }) =>
      isActive ? "nav-item active" : "nav-item"
    }
  >
    <span>📦</span>
    Spare Parts
  </NavLink>

  <NavLink
    to="/billing"
    className={({ isActive }) =>
      isActive ? "nav-item active" : "nav-item"
    }
  >
    <span>🧾</span>
    Billing
  </NavLink>

  <NavLink
    to="/reports"
    className={({ isActive }) =>
      isActive ? "nav-item active" : "nav-item"
    }
  >
    <span>📊</span>
    Reports
  </NavLink>

</nav>

        <div className="sidebar-bottom">

  <NavLink
    to="/settings"
    className={({ isActive }) =>
      isActive ? "nav-item active" : "nav-item"
    }
  >
    <span>⚙️</span>
    Settings
  </NavLink>

  <button type="button" className="nav-item logout" onClick={logout}>
    <span>↪</span>
    Sign out
  </button>

</div>

      </aside>

      {/* Main Content */}
      <main className="dashboard-main">

        {/* Top Bar */}
        <header className="topbar">

          <div>
            <h1>Dashboard</h1>
            <p>Welcome back! Here's what's happening today.</p>
          </div>

          <div className="profile">

            <div className="notification">
              🔔
              <span>3</span>
            </div>

            <div className="profile-avatar">
              A
            </div>

            <div className="profile-info">
              <strong>{user.email}</strong>
              <span>Administrator</span>
            </div>

          </div>

        </header>

        {/* Statistics */}
        <section className="stats-grid">

          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div>
              <p>Total Customers</p>
              <h2>248</h2>
              <span className="positive">↑ 12% this month</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🚘</div>
            <div>
              <p>Total Vehicles</p>
              <h2>326</h2>
              <span className="positive">↑ 8% this month</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🔧</div>
            <div>
              <p>Pending Services</p>
              <h2>18</h2>
              <span className="warning">Needs attention</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div>
              <p>Monthly Revenue</p>
              <h2>₹1,84,500</h2>
              <span className="positive">↑ 15% this month</span>
            </div>
          </div>

        </section>

        {/* Dashboard Content */}
        <section className="dashboard-grid">

          <div className="dashboard-card">

            <div className="card-header">
              <div>
                <h3>Recent Service Requests</h3>
                <p>Latest vehicle service activities</p>
              </div>

              <button>View All</button>
            </div>

            <div className="service-table">

              <div className="table-row table-heading">
                <span>Customer</span>
                <span>Vehicle</span>
                <span>Service</span>
                <span>Status</span>
              </div>

              <div className="table-row">
                <span>Customer 01</span>
                <span>Honda City</span>
                <span>Full Service</span>
                <span className="status completed">Completed</span>
              </div>

              <div className="table-row">
                <span>Customer 02</span>
                <span>Hyundai i20</span>
                <span>Oil Change</span>
                <span className="status progress">In Progress</span>
              </div>

              <div className="table-row">
                <span>Customer 03</span>
                <span>Tata Nexon</span>
                <span>Brake Service</span>
                <span className="status pending">Pending</span>
              </div>

              <div className="table-row">
                <span>Customer 04</span>
                <span>Maruti Swift</span>
                <span>AC Service</span>
                <span className="status completed">Completed</span>
              </div>

            </div>

          </div>

          <div className="dashboard-card">

            <div className="card-header">
              <div>
                <h3>Service Overview</h3>
                <p>Current service status</p>
              </div>
            </div>

            <div className="service-overview">

              <div className="overview-item">
                <span className="overview-dot completed-dot"></span>
                <span>Completed</span>
                <strong>42</strong>
              </div>

              <div className="overview-item">
                <span className="overview-dot progress-dot"></span>
                <span>In Progress</span>
                <strong>18</strong>
              </div>

              <div className="overview-item">
                <span className="overview-dot pending-dot"></span>
                <span>Pending</span>
                <strong>12</strong>
              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;