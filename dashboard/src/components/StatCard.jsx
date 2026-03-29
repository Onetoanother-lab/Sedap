import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

// FIX: Added optional `unit` prop (defaults to empty string).
// Callers that display monetary values pass unit="UZS";
// count-based cards (Total Orders, Canceled, Delivered) pass no unit.
const StatCard = ({ title, value, percent, unit = "" }) => {
  const isPositive = percent >= 0;

  return (
    <div className="bg-base-100 p-5 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 flex items-center gap-4">

      {/* ICON */}
      <div
        className={`w-14 h-14 rounded-xl flex items-center justify-center ${
          isPositive ? "bg-success/10" : "bg-error/10"
        }`}
      >
        {isPositive ? (
          <TrendingUp className="text-success" />
        ) : (
          <TrendingDown className="text-error" />
        )}
      </div>

      {/* CONTENT */}
      <div className="flex-1">
        <p className="text-sm text-base-content/60">{title}</p>

        <h2 className="text-2xl font-semibold text-base-content">
          {value.toLocaleString()}
          {unit && (
            <span className="text-sm text-base-content/40 ml-1">{unit}</span>
          )}
        </h2>

        <div
          className={`text-sm font-medium flex items-center gap-1 ${
            isPositive ? "text-success" : "text-error"
          }`}
        >
          {isPositive ? "▲" : "▼"} {Math.abs(percent)}%
          <span className="text-base-content/40 font-normal text-xs ml-1">vs last month</span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;