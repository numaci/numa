import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  today?: string | number;
  month?: string | number;
  todayLabel?: string;
  monthLabel?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, today, month, todayLabel, monthLabel }) => (
  <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${color}`}>
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {(today !== undefined || month !== undefined) && (
          <div className="mt-1 text-xs text-gray-500 space-x-2">
            {today !== undefined && <span>{todayLabel}: <b>{today}</b></span>}
            {month !== undefined && <span>{monthLabel}: <b>{month}</b></span>}
          </div>
        )}
      </div>
    </div>
  </div>
);

export default StatCard; 