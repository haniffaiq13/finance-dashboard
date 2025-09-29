'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { formatCurrency } from '@/lib/format';

interface TrendLineChartProps {
  data: Array<{
    month: string;
    balance: number;
  }>;
}

export function TrendLineChart({ data }: TrendLineChartProps) {
  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-');
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      return (
        <div className="bg-white border rounded-lg p-3 shadow-md">
          <p className="font-medium">{formatMonth(label)}</p>
          <p className={`font-semibold ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            Saldo: {formatCurrency(value)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Determine if we should use area chart based on data trend
  const hasNegativeValues = data.some(item => item.balance < 0);

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month" 
            tickFormatter={formatMonth}
            fontSize={12}
          />
          <YAxis 
            tickFormatter={(value) => formatCurrency(value)}
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="balance"
            stroke="#10b981"
            strokeWidth={3}
            fill="url(#balanceGradient)"
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
          />
          {/* Add a reference line at y=0 if there are negative values */}
          {hasNegativeValues && (
            <Line
              type="monotone"
              dataKey={() => 0}
              stroke="#64748b"
              strokeDasharray="5 5"
              dot={false}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}