import BackToDashboard from "../components/BackToDashboard";
function Settings() {
  return (
    <div className="page-content">
    <BackToDashboard />
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your account and system preferences</p>
        </div>
      </div>

      <div className="content-card settings-card">

        <div className="settings-section">
          <h3>Account Information</h3>
          <p>Update your administrator account details</p>

          <div className="settings-form">

            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value="Admin"
                readOnly
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value="admin@autocare.com"
                readOnly
              />
            </div>

            <div className="form-group">
              <label>Role</label>
              <input
                type="text"
                value="Administrator"
                readOnly
              />
            </div>

          </div>
        </div>

        <div className="settings-section">
          <h3>System Preferences</h3>
          <p>Configure your vehicle service management system</p>

          <div className="setting-option">
            <div>
              <strong>Email Notifications</strong>
              <span>Receive notifications about new service requests</span>
            </div>

            <input type="checkbox" defaultChecked />
          </div>

          <div className="setting-option">
            <div>
              <strong>Low Stock Alerts</strong>
              <span>Get notified when spare parts are running low</span>
            </div>

            <input type="checkbox" defaultChecked />
          </div>

        </div>

        <div className="settings-actions">
          <button className="primary-button">
            Save Changes
          </button>
        </div>

      </div>

    </div>
  );
}

export default Settings;