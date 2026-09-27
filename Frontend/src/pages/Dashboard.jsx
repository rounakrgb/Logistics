import StatCard from "../components/StatCard";

function Dashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Dashboard
        </h1>
        <p className="text-slate-500 mt-2">
          Monitor your logistics operations at a glance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

        <StatCard
          title="Total Vehicles"
          value="124"
          subtitle="8 added this month"
          icon="🚛"
        />

        <StatCard
          title="Active Trips"
          value="38"
          subtitle="6 currently delayed"
          icon="🛣️"
        />

        <StatCard
          title="Shipments"
          value="286"
          subtitle="92% delivered on time"
          icon="📦"
        />

        <StatCard
          title="Maintenance"
          value="6"
          subtitle="Vehicles need attention"
          icon="🔧"
        />

      </div>
    </div>
  );
}

export default Dashboard;