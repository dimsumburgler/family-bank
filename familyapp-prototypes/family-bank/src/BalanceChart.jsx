import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Generate mock monthly balance data for the past 6 months
function generateMonthlyData(currentBalance) {
  const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
  const data = [];
  let balance = currentBalance * 0.6; // Start 6 months ago at 60% of current
  
  months.forEach((month, index) => {
    // Add some random variation and growth
    const growth = (currentBalance - balance) / (6 - index) * (0.8 + Math.random() * 0.4);
    balance += growth;
    
    data.push({
      month,
      balance: Math.round(balance * 100) / 100,
      fullMonth: getFullMonthName(month)
    });
  });
  
  // Add current month
  data.push({
    month: 'Now',
    balance: currentBalance,
    fullMonth: 'Current'
  });
  
  return data;
}

function getFullMonthName(shortMonth) {
  const monthMap = {
    'Jan': 'January', 'Feb': 'February', 'Mar': 'March', 'Apr': 'April',
    'May': 'May', 'Jun': 'June', 'Jul': 'July', 'Aug': 'August',
    'Sep': 'September', 'Oct': 'October', 'Nov': 'November', 'Dec': 'December'
  };
  return monthMap[shortMonth] || shortMonth;
}

// Custom tooltip
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-200">
        <p className="text-slate-500 text-xs mb-1">{payload[0].payload.fullMonth}</p>
        <p className="text-slate-800 font-semibold">
          ${payload[0].value.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
}

export function BalanceChart({ currentBalance, childName }) {
  const data = generateMonthlyData(currentBalance);
  
  // Calculate trend
  const firstBalance = data[0].balance;
  const lastBalance = data[data.length - 1].balance;
  const growth = ((lastBalance - firstBalance) / firstBalance) * 100;
  const isPositive = growth >= 0;
  
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-800">Balance History</h3>
          <p className="text-xs text-slate-500">Past 6 months</p>
        </div>
        <div className={`text-right ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
          <div className="text-lg font-bold">
            {isPositive ? '+' : ''}{growth.toFixed(1)}%
          </div>
          <div className="text-xs">{isPositive ? '📈 Growing' : '📉 Declining'}</div>
        </div>
      </div>
      
      {/* Chart */}
      <div className="h-48 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickFormatter={(value) => `$${value}`}
              dx={-5}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#8b5cf6"
              strokeWidth={3}
              fill="url(#balanceGradient)"
              dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4, stroke: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#7c3aed' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
        <div className="text-center">
          <div className="text-xs text-slate-500 mb-0.5">Starting</div>
          <div className="font-semibold text-slate-700">${firstBalance.toFixed(0)}</div>
        </div>
        <div className="text-center border-x border-slate-100">
          <div className="text-xs text-slate-500 mb-0.5">Current</div>
          <div className="font-semibold text-violet-600">${lastBalance.toFixed(0)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-slate-500 mb-0.5">Saved</div>
          <div className="font-semibold text-emerald-500">+${(lastBalance - firstBalance).toFixed(0)}</div>
        </div>
      </div>
    </div>
  );
}
