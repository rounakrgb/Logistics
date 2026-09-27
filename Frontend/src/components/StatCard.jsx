function StatCard({ title, value, subtitle, icon }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h2 className="text-3xl font-bold text-slate-900 mt-2">
            {value}
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            {subtitle}
          </p>
        </div>

        <div className="text-3xl">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default StatCard;