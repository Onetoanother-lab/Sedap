// src/components/StatCard.jsx
import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const StatCard = ({ title, value, percent }) => {
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
          {value.toLocaleString()}{" "}
          <span className="text-sm text-base-content/40">UZS</span>
        </h2>

        <div
          className={`text-sm font-medium flex items-center gap-1 ${
            isPositive ? "text-success" : "text-error"
          }`}
        >
          {isPositive ? "▲" : "▼"} {Math.abs(percent)}%
        </div>
      </div>
    </div>
  );
};

export default StatCard;









