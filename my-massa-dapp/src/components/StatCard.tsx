const StatCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) => (
  <div className="p-4 rounded-lg bg-slate-700/50 flex flex-col items-center">
    <div className="mb-2">{icon}</div>
    <div className="text-white font-bold text-sm">{value}</div>
    <div className="text-slate-400 text-xs">{label}</div>
  </div>
);

export default StatCard