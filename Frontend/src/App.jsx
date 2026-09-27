import { useState, useEffect } from "react";
import api from "./services/api.jsx";
import "./index.css";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [vehicles, setVehicles] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [isShipmentFormOpen, setIsShipmentFormOpen] = useState(false);
  const [shipmentForm, setShipmentForm] = useState({
    customer: "",
    origin: "",
    destination: "",
    driver: "",
  });
  const [drivers, setDrivers] = useState([]);
  const [vehicleForm, setVehicleForm] = useState({ vehicle_number: "", type: "Truck" });
  const [driverForm, setDriverForm] = useState({ name: "", phone: "", license_number: "" });
  const [trips, setTrips] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [fuel, setFuel] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [settings, setSettings] = useState({ company_name: "", timezone: "", email_notifications: false });
  const [recordForm, setRecordForm] = useState({ vehicle_number: "", description: "", amount: "" });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    api.get("/vehicles")
      .then((response) => {
        setVehicles(response.data);
      })
      .catch((error) => {
        console.error("Backend Error:", error);
      });
  }, []);

  useEffect(() => {
    Promise.all([api.get("/trips"), api.get("/maintenance"), api.get("/fuel"), api.get("/analytics"), api.get("/settings")])
      .then(([tripsResponse, maintenanceResponse, fuelResponse, analyticsResponse, settingsResponse]) => {
        setTrips(tripsResponse.data);
        setMaintenance(maintenanceResponse.data);
        setFuel(fuelResponse.data);
        setAnalytics(analyticsResponse.data);
        setSettings(settingsResponse.data);
      })
      .catch((error) => console.error("Operations data error:", error));
  }, []);

  useEffect(() => {
    api.get("/drivers")
      .then((response) => setDrivers(response.data))
      .catch((error) => console.error("Drivers Error:", error));
  }, []);

  useEffect(() => {
    api.get("/shipments")
      .then((response) => setShipments(response.data))
      .catch((error) => console.error("Shipments Error:", error));
  }, []);

  const handleShipmentSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await api.post("/shipments", shipmentForm);
      setShipments((currentShipments) => [response.data, ...currentShipments]);
      setShipmentForm({ customer: "", origin: "", destination: "", driver: "" });
      setIsShipmentFormOpen(false);
    } catch (error) {
      console.error("Create Shipment Error:", error);
    }
  };

  const handleVehicleSubmit = async (event) => {
    event.preventDefault();
    const response = await api.post("/vehicles", vehicleForm);
    setVehicles((currentVehicles) => [...currentVehicles, response.data]);
    setVehicleForm({ vehicle_number: "", type: "Truck" });
  };

  const handleDriverSubmit = async (event) => {
    event.preventDefault();
    const response = await api.post("/drivers", driverForm);
    setDrivers((currentDrivers) => [...currentDrivers, response.data]);
    setDriverForm({ name: "", phone: "", license_number: "" });
  };

  const handleRecordSubmit = async (event, type) => {
    event.preventDefault();
    const response = await api.post(`/${type}`, { ...recordForm, amount: Number(recordForm.amount) });
    if (type === "maintenance") setMaintenance((records) => [...records, response.data]);
    if (type === "fuel") setFuel((records) => [...records, response.data]);
    setRecordForm({ vehicle_number: "", description: "", amount: "" });
  };

  const handleSettingsSubmit = async (event) => {
    event.preventDefault();
    const response = await api.put("/settings", settings);
    setSettings(response.data);
  };

  const searchResults = searchQuery.trim()
    ? [
        ...shipments.map((item) => ({ type: "Shipment", label: `SH-${item.id} - ${item.customer}`, detail: `${item.origin} to ${item.destination}` })),
        ...vehicles.map((item) => ({ type: "Vehicle", label: item.vehicle_number, detail: `${item.type} - ${item.status}` })),
        ...drivers.map((item) => ({ type: "Driver", label: item.name, detail: `${item.phone} - ${item.status}` })),
      ].filter((item) => `${item.label} ${item.detail}`.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const menuItems = [
    { name: "Dashboard", icon: "🏠" },
    { name: "Fleet", icon: "🚚" },
    { name: "Drivers", icon: "👨‍✈️" },
    { name: "Shipments", icon: "📦" },
    { name: "Trips", icon: "🛣️" },
    { name: "Maintenance", icon: "🔧" },
    { name: "Fuel", icon: "⛽" },
    { name: "Analytics", icon: "📊" },
  ];

  return (
    <div className="app">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="logo">
          <div className="logo-icon">🚚</div>
          <div>
            <h2>SwiftLog</h2>
            <span>Logistics Management</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p className="menu-title">MAIN MENU</p>

          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${
                activePage === item.name ? "active" : ""
              }`}
              onClick={() => setActivePage(item.name)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className={`nav-item ${activePage === "Settings" ? "active" : ""}`} onClick={() => setActivePage("Settings")}>
            <span className="nav-icon">⚙️</span>
            <span>Settings</span>
          </button>

          <div className="user-box">
            <div className="avatar">R</div>

            <div className="user-info">
              <strong>Rounak</strong>
              <span>Administrator</span>
            </div>

            <span className="more">⋮</span>
          </div>
        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">

        {/* TOP NAVBAR */}
        <header className="topbar">

          <div>
            <p className="breadcrumb">Pages / {activePage}</p>
            <h1>{activePage}</h1>
          </div>

          <div className="topbar-actions">

            <button className="icon-button" title="Search" onClick={() => { setIsSearchOpen((open) => !open); setIsNotificationsOpen(false); }}>
              🔍
            </button>

            <button className="icon-button notification" title="Notifications" onClick={() => { setIsNotificationsOpen((open) => !open); setIsSearchOpen(false); }}>
              🔔
              <span className="notification-dot"></span>
            </button>

            <div className="profile">
              <div className="avatar">R</div>
              <div>
                <strong>Rounak</strong>
                <span>Admin</span>
              </div>
            </div>

          </div>

        </header>

        {isSearchOpen && (
          <div className="topbar-popover search-popover">
            <input autoFocus placeholder="Search shipments, vehicles, drivers..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
            {searchQuery && (searchResults.length ? searchResults.map((result) => <button className="search-result" key={`${result.type}-${result.label}`} onClick={() => { setSearchQuery(result.label); setIsSearchOpen(false); }}><strong>{result.type}</strong><span>{result.label}</span><small>{result.detail}</small></button>) : <p className="popover-empty">No matching records</p>)}
          </div>
        )}

        {isNotificationsOpen && (
          <div className="topbar-popover notifications-popover">
            <div className="popover-heading"><strong>Notifications</strong><span>3 active</span></div>
            <div className="notification-item"><span>⚠️</span><div><strong>Vehicle maintenance due</strong><small>TRK-001 requires service</small></div></div>
            <div className="notification-item"><span>🚨</span><div><strong>Shipment delayed</strong><small>Shipment #SH1029 is delayed</small></div></div>
            <div className="notification-item"><span>ℹ️</span><div><strong>Driver license expiring</strong><small>License expires in 12 days</small></div></div>
          </div>
        )}

        {/* DASHBOARD */}
        {activePage === "Dashboard" && (
          <section className="dashboard">

            <div className="welcome-section">
              <div>
                <h2>Good evening, Rounak 👋</h2>
                <p>
                  Here's what's happening with your logistics operations today.
                </p>
              </div>

              <button className="primary-button" onClick={() => setIsShipmentFormOpen(true)}>
                + Add Shipment
              </button>
            </div>

            {/* STAT CARDS */}
            <div className="stats-grid">

              <div className="stat-card">
                <div className="stat-top">
                  <span>Total Vehicles</span>
                  <div className="stat-icon blue">🚚</div>
                </div>

                <h3>{vehicles.length}</h3>

                <p className="positive">
                  ↑ 8.2% <span>vs last month</span>
                </p>
              </div>

              <div className="stat-card">
                <div className="stat-top">
                  <span>Active Trips</span>
                  <div className="stat-icon purple">🛣️</div>
                </div>

                <h3>48</h3>

                <p className="positive">
                  ↑ 5.4% <span>vs last month</span>
                </p>
              </div>

              <div className="stat-card">
                <div className="stat-top">
                  <span>Deliveries</span>
                  <div className="stat-icon green">📦</div>
                </div>

                <h3>86</h3>

                <p className="positive">
                  ↑ 12.5% <span>vs last month</span>
                </p>
              </div>

              <div className="stat-card">
                <div className="stat-top">
                  <span>Active Drivers</span>
                  <div className="stat-icon orange">👨‍✈️</div>
                </div>

                <h3>74</h3>

                <p className="negative">
                  ↓ 2.1% <span>vs last month</span>
                </p>
              </div>

            </div>

            {/* LOWER SECTION */}
            <div className="dashboard-grid">

              {/* DELIVERY CHART */}
              <div className="panel chart-panel">

                <div className="panel-header">
                  <div>
                    <h3>Delivery Overview</h3>
                    <p>Weekly delivery performance</p>
                  </div>

                  <select>
                    <option>This Week</option>
                    <option>This Month</option>
                    <option>This Year</option>
                  </select>
                </div>

                <div className="chart">

                  <div className="chart-y">
                    <span>100</span>
                    <span>75</span>
                    <span>50</span>
                    <span>25</span>
                    <span>0</span>
                  </div>

                  <div className="chart-area">

                    <div className="grid-line"></div>
                    <div className="grid-line"></div>
                    <div className="grid-line"></div>
                    <div className="grid-line"></div>
                    <div className="grid-line"></div>

                    <div className="bars">
                      <div className="bar" style={{ height: "55%" }}></div>
                      <div className="bar" style={{ height: "70%" }}></div>
                      <div className="bar" style={{ height: "62%" }}></div>
                      <div className="bar" style={{ height: "82%" }}></div>
                      <div className="bar" style={{ height: "74%" }}></div>
                      <div className="bar" style={{ height: "91%" }}></div>
                      <div className="bar" style={{ height: "78%" }}></div>
                    </div>

                    <div className="chart-x">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                      <span>Sun</span>
                    </div>

                  </div>

                </div>

              </div>

              {/* ALERTS */}
              <div className="panel alerts-panel">

                <div className="panel-header">
                  <div>
                    <h3>Recent Alerts</h3>
                    <p>Things that need attention</p>
                  </div>

                  <button className="view-button">
                    View all
                  </button>
                </div>

                <div className="alert-list">

                  <div className="alert">
                    <div className="alert-icon warning">⚠️</div>
                    <div>
                      <strong>Vehicle maintenance due</strong>
                      <p>TRK-001 requires service</p>
                      <small>10 min ago</small>
                    </div>
                  </div>

                  <div className="alert">
                    <div className="alert-icon danger">🚨</div>
                    <div>
                      <strong>Shipment delayed</strong>
                      <p>Shipment #SH1029 is delayed</p>
                      <small>32 min ago</small>
                    </div>
                  </div>

                  <div className="alert">
                    <div className="alert-icon info">ℹ️</div>
                    <div>
                      <strong>Driver license expiring</strong>
                      <p>License expires in 12 days</p>
                      <small>1 hour ago</small>
                    </div>
                  </div>

                </div>

              </div>

            </div>

            {/* RECENT SHIPMENTS */}
            <div className="panel shipments-panel">

              <div className="panel-header">
                <div>
                  <h3>Recent Shipments</h3>
                  <p>Latest shipment activity</p>
                </div>

                <button className="view-button">
                  View all
                </button>
              </div>

              <div className="table-wrapper">

                <table>

                  <thead>
                    <tr>
                      <th>Shipment ID</th>
                      <th>Customer</th>
                      <th>Origin</th>
                      <th>Destination</th>
                      <th>Driver</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {shipments.map((shipment) => (
                      <tr key={shipment.id}>
                        <td><strong>#{`SH-${shipment.id}`}</strong></td>
                        <td>{shipment.customer}</td>
                        <td>{shipment.origin}</td>
                        <td>{shipment.destination}</td>
                        <td>{shipment.driver}</td>
                        <td>
                          <span className={`status ${shipment.status.toLowerCase().replace(" ", "-")}`}>
                            {shipment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>

              </div>

            </div>

          </section>
        )}

        {activePage === "Fleet" && (
          <section className="management-page">
            <div className="management-grid">
              <form className="panel management-form" onSubmit={handleVehicleSubmit}>
                <div className="panel-header"><div><h3>Add Vehicle</h3><p>Register a vehicle in your fleet.</p></div></div>
                <label>Vehicle number<input required value={vehicleForm.vehicle_number} onChange={(event) => setVehicleForm({ ...vehicleForm, vehicle_number: event.target.value })} placeholder="TRK-004" /></label>
                <label>Type<select value={vehicleForm.type} onChange={(event) => setVehicleForm({ ...vehicleForm, type: event.target.value })}><option>Truck</option><option>Van</option><option>Trailer</option></select></label>
                <button className="primary-button" type="submit">Add Vehicle</button>
              </form>
              <div className="panel management-list"><div className="panel-header"><div><h3>Fleet Vehicles</h3><p>{vehicles.length} vehicles registered</p></div></div><div className="table-wrapper"><table><thead><tr><th>Vehicle</th><th>Type</th><th>Status</th></tr></thead><tbody>{vehicles.map((vehicle) => <tr key={vehicle.id}><td><strong>{vehicle.vehicle_number}</strong></td><td>{vehicle.type}</td><td><span className="status delivered">{vehicle.status}</span></td></tr>)}</tbody></table></div></div>
            </div>
          </section>
        )}

        {activePage === "Drivers" && (
          <section className="management-page">
            <div className="management-grid">
              <form className="panel management-form" onSubmit={handleDriverSubmit}>
                <div className="panel-header"><div><h3>Add Driver</h3><p>Register a driver for dispatch.</p></div></div>
                <label>Full name<input required value={driverForm.name} onChange={(event) => setDriverForm({ ...driverForm, name: event.target.value })} /></label>
                <label>Phone<input required value={driverForm.phone} onChange={(event) => setDriverForm({ ...driverForm, phone: event.target.value })} /></label>
                <label>License number<input required value={driverForm.license_number} onChange={(event) => setDriverForm({ ...driverForm, license_number: event.target.value })} /></label>
                <button className="primary-button" type="submit">Add Driver</button>
              </form>
              <div className="panel management-list"><div className="panel-header"><div><h3>Drivers</h3><p>{drivers.length} drivers registered</p></div></div><div className="table-wrapper"><table><thead><tr><th>Name</th><th>Phone</th><th>License</th><th>Status</th></tr></thead><tbody>{drivers.map((driver) => <tr key={driver.id}><td><strong>{driver.name}</strong></td><td>{driver.phone}</td><td>{driver.license_number}</td><td><span className="status delivered">{driver.status}</span></td></tr>)}</tbody></table></div></div>
            </div>
          </section>
        )}

        {activePage === "Shipments" && (
          <section className="management-page"><div className="panel management-list"><div className="panel-header"><div><h3>Shipments</h3><p>{shipments.length} shipments tracked</p></div><button className="primary-button" onClick={() => setIsShipmentFormOpen(true)}>+ Add Shipment</button></div><div className="table-wrapper"><table><thead><tr><th>ID</th><th>Customer</th><th>Route</th><th>Driver</th><th>Status</th></tr></thead><tbody>{shipments.map((shipment) => <tr key={shipment.id}><td><strong>SH-{shipment.id}</strong></td><td>{shipment.customer}</td><td>{shipment.origin} to {shipment.destination}</td><td>{shipment.driver}</td><td><span className="status delivered">{shipment.status}</span></td></tr>)}</tbody></table></div></div></section>
        )}

        {activePage === "Trips" && (
          <section className="management-page"><div className="panel management-list"><div className="panel-header"><div><h3>Trips</h3><p>Live route activity</p></div></div><div className="table-wrapper"><table><thead><tr><th>Shipment</th><th>Vehicle</th><th>Driver</th><th>Route</th><th>Status</th></tr></thead><tbody>{trips.map((trip) => <tr key={trip.id}><td><strong>{trip.shipment}</strong></td><td>{trip.vehicle}</td><td>{trip.driver}</td><td>{trip.route}</td><td><span className="status transit">{trip.status}</span></td></tr>)}</tbody></table></div></div></section>
        )}

        {(activePage === "Maintenance" || activePage === "Fuel") && (
          <section className="management-page"><div className="management-grid"><form className="panel management-form" onSubmit={(event) => handleRecordSubmit(event, activePage.toLowerCase())}><div className="panel-header"><div><h3>{activePage} Record</h3><p>Record operational costs.</p></div></div><label>Vehicle number<input required value={recordForm.vehicle_number} onChange={(event) => setRecordForm({ ...recordForm, vehicle_number: event.target.value })} placeholder="TRK-001" /></label><label>Description<input required value={recordForm.description} onChange={(event) => setRecordForm({ ...recordForm, description: event.target.value })} /></label><label>Amount<input required type="number" min="0" value={recordForm.amount} onChange={(event) => setRecordForm({ ...recordForm, amount: event.target.value })} /></label><button className="primary-button" type="submit">Save Record</button></form><div className="panel management-list"><div className="panel-header"><div><h3>{activePage} History</h3><p>{(activePage === "Maintenance" ? maintenance : fuel).length} records</p></div></div><div className="table-wrapper"><table><thead><tr><th>Vehicle</th><th>Description</th><th>Amount</th><th>Status</th></tr></thead><tbody>{(activePage === "Maintenance" ? maintenance : fuel).map((record) => <tr key={record.id}><td>{record.vehicle_number}</td><td>{record.description}</td><td>Rs. {record.amount.toLocaleString()}</td><td><span className="status delivered">{record.status}</span></td></tr>)}</tbody></table></div></div></div></section>
        )}

        {activePage === "Analytics" && analytics && (
          <section className="management-page"><div className="stats-grid"><div className="stat-card"><div className="stat-top"><span>Total Shipments</span><div className="stat-icon blue">📦</div></div><h3>{analytics.total_shipments}</h3></div><div className="stat-card"><div className="stat-top"><span>Active Trips</span><div className="stat-icon purple">🛣️</div></div><h3>{analytics.active_trips}</h3></div><div className="stat-card"><div className="stat-top"><span>Fuel Spend</span><div className="stat-icon orange">⛽</div></div><h3>Rs. {analytics.fuel_spend.toLocaleString()}</h3></div><div className="stat-card"><div className="stat-top"><span>Maintenance Spend</span><div className="stat-icon green">🔧</div></div><h3>Rs. {analytics.maintenance_spend.toLocaleString()}</h3></div></div></section>
        )}

        {activePage === "Settings" && (
          <section className="management-page"><form className="panel management-form settings-form" onSubmit={handleSettingsSubmit}><div className="panel-header"><div><h3>Settings</h3><p>Manage workspace preferences.</p></div></div><label>Company name<input required value={settings.company_name} onChange={(event) => setSettings({ ...settings, company_name: event.target.value })} /></label><label>Timezone<select value={settings.timezone} onChange={(event) => setSettings({ ...settings, timezone: event.target.value })}><option>Asia/Kolkata</option><option>UTC</option><option>America/New_York</option></select></label><label className="checkbox-label"><input type="checkbox" checked={settings.email_notifications} onChange={(event) => setSettings({ ...settings, email_notifications: event.target.checked })} /> Email notifications</label><button className="primary-button" type="submit">Save Settings</button></form></section>
        )}

        {activePage !== "Dashboard" && !["Fleet", "Drivers", "Shipments", "Trips", "Maintenance", "Fuel", "Analytics", "Settings"].includes(activePage) && (
          <section className="empty-page"><div className="empty-icon">{menuItems.find((item) => item.name === activePage)?.icon}</div><h2>{activePage}</h2><p>The {activePage.toLowerCase()} management module is coming next.</p><button className="primary-button" onClick={() => setActivePage("Dashboard")}>← Back to Dashboard</button></section>
        )}

        {isShipmentFormOpen && (
          <div className="modal-backdrop" onClick={() => setIsShipmentFormOpen(false)}>
            <form className="shipment-form" onSubmit={handleShipmentSubmit} onClick={(event) => event.stopPropagation()}>
              <div className="panel-header">
                <div>
                  <h3>Add Shipment</h3>
                  <p>Enter the shipment details below.</p>
                </div>
                <button type="button" className="view-button" onClick={() => setIsShipmentFormOpen(false)}>Close</button>
              </div>
              <label>Customer<input required value={shipmentForm.customer} onChange={(event) => setShipmentForm({ ...shipmentForm, customer: event.target.value })} /></label>
              <label>Origin<input required value={shipmentForm.origin} onChange={(event) => setShipmentForm({ ...shipmentForm, origin: event.target.value })} /></label>
              <label>Destination<input required value={shipmentForm.destination} onChange={(event) => setShipmentForm({ ...shipmentForm, destination: event.target.value })} /></label>
              <label>Driver<input required value={shipmentForm.driver} onChange={(event) => setShipmentForm({ ...shipmentForm, driver: event.target.value })} /></label>
              <button type="submit" className="primary-button">Create Shipment</button>
            </form>
          </div>
        )}

      </main>

    </div>
  );
}

export default App;